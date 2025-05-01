import os
import re
import nltk
from faster_whisper import WhisperModel
from nltk.sentiment import SentimentIntensityAnalyzer
from transformers import pipeline, AutoTokenizer, logging

# Suppress warnings
logging.set_verbosity_error()

# NLTK setup
nltk.download('vader_lexicon')

# Initialize analyzers
vader_analyzer = SentimentIntensityAnalyzer()
distilbert_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english"
)
tokenizer = AutoTokenizer.from_pretrained("distilbert/distilbert-base-uncased-finetuned-sst-2-english")

# Transcribe audio using Faster-Whisper
def transcribe_audio(file_path):
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(file_path, beam_size=5)
    text = " ".join([seg.text for seg in segments])
    return text.strip()

# Analyze individual phrase - returns dictionary with detailed sentiment analysis
def analyze_phrase_detailed(phrase):
    tokens = tokenizer.encode(phrase, truncation=False)
    if len(tokens) > 512:
        phrase = tokenizer.decode(tokens[:512], skip_special_tokens=True)

    vader_scores = vader_analyzer.polarity_scores(phrase)
    distilbert_result = distilbert_analyzer(phrase, truncation=True)[0]

    return {
        "text": phrase,
        "vader_sentiment": (
            "Positive" if vader_scores['compound'] >= 0.05 else
            "Negative" if vader_scores['compound'] <= -0.05 else
            "Neutral"
        ),
        "vader_compound": vader_scores['compound'],
        "distilbert_label": distilbert_result['label'],
        "distilbert_score": distilbert_result['score']
    }

# Simple version that returns just the compound score (for backward compatibility)
def analyze_phrase(phrase):
    analysis = analyze_phrase_detailed(phrase)
    return analysis["vader_compound"]