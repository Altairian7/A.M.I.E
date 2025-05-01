import os
import re
import nltk
import time
from functools import lru_cache
from nltk.sentiment import SentimentIntensityAnalyzer
from transformers import pipeline, AutoTokenizer, logging

# Suppress warnings
logging.set_verbosity_error()

# Global variables to store models
_whisper_model = None
_vader_analyzer = None
_distilbert_analyzer = None
_tokenizer = None

# NLTK setup - only download data when needed
def setup_nltk():
    nltk.download('vader_lexicon', quiet=True)

# Lazy loading functions for models
def get_vader_analyzer():
    global _vader_analyzer
    if _vader_analyzer is None:
        print("🔧 Initializing VADER sentiment analyzer...")
        setup_nltk()
        _vader_analyzer = SentimentIntensityAnalyzer()
        print("✅ VADER analyzer initialized")
    return _vader_analyzer

def get_distilbert():
    global _distilbert_analyzer, _tokenizer
    if _distilbert_analyzer is None:
        print("🔧 Initializing DistilBERT model...")
        start_time = time.time()
        _distilbert_analyzer = pipeline(
            "sentiment-analysis",
            model="distilbert/distilbert-base-uncased-finetuned-sst-2-english"
        )
        _tokenizer = AutoTokenizer.from_pretrained("distilbert/distilbert-base-uncased-finetuned-sst-2-english")
        load_time = time.time() - start_time
        print(f"✅ DistilBERT model initialized in {load_time:.2f} seconds")
    return _distilbert_analyzer, _tokenizer

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        print(f"🎤 Loading WhisperModel for transcription...")
        start_loading = time.time()
        # Import here to avoid loading at startup
        from faster_whisper import WhisperModel
        _whisper_model = WhisperModel("small", device="cpu", compute_type="int8")
        load_time = time.time() - start_loading
        print(f"✅ WhisperModel loaded in {load_time:.2f} seconds")
    return _whisper_model

# Transcribe audio using Faster-Whisper
def transcribe_audio(file_path):
    print(f"🎤 Starting transcription for: {os.path.basename(file_path)}")
    print(f"🎤 File size: {os.path.getsize(file_path)/1024/1024:.2f} MB")
    
    # Lazy load the model
    model = get_whisper_model()
    
    transcribe_start = time.time()
    segments, _ = model.transcribe(file_path, beam_size=5)
    
    print("🎤 Processing segments...")
    text_segments = []
    for i, seg in enumerate(segments):
        text_segments.append(seg.text)
        if i < 3:  # Print first few segments to show progress
            print(f"🎤 Segment {i+1}: {seg.text}")
    
    if len(text_segments) > 3:
        print(f"🎤 ... and {len(text_segments) - 3} more segments")
        
    text = " ".join(text_segments)
    
    transcribe_time = time.time() - transcribe_start
    print(f"✅ Transcription completed in {transcribe_time:.2f} seconds")
    print(f"✅ Total text length: {len(text)} characters")
    
    return text.strip()

# Analyze individual phrase - returns dictionary with detailed sentiment analysis
def analyze_phrase_detailed(phrase):
    print(f"😀 Starting detailed sentiment analysis...")
    print(f"😀 Text length: {len(phrase)} characters")
    
    # Lazy load models
    vader_analyzer = get_vader_analyzer()
    distilbert_analyzer, tokenizer = get_distilbert()
    
    # Truncate if needed
    tokens = tokenizer.encode(phrase, truncation=False)
    if len(tokens) > 512:
        print(f"⚠️ Text too long ({len(tokens)} tokens), truncating to 512 tokens")
        phrase = tokenizer.decode(tokens[:512], skip_special_tokens=True)
    
    print(f"😀 Running VADER sentiment analysis...")
    vader_start = time.time()
    vader_scores = vader_analyzer.polarity_scores(phrase)
    vader_time = time.time() - vader_start
    print(f"✅ VADER analysis completed in {vader_time:.2f} seconds")
    
    print(f"😀 Running DistilBERT sentiment analysis...")
    distilbert_start = time.time()
    distilbert_result = distilbert_analyzer(phrase, truncation=True)[0]
    distilbert_time = time.time() - distilbert_start
    print(f"✅ DistilBERT analysis completed in {distilbert_time:.2f} seconds")

    sentiment = (
        "Positive" if vader_scores['compound'] >= 0.05 else
        "Negative" if vader_scores['compound'] <= -0.05 else
        "Neutral"
    )
    
    print(f"📊 Sentiment: {sentiment}")
    print(f"📊 VADER compound score: {vader_scores['compound']:.4f}")
    print(f"📊 DistilBERT: {distilbert_result['label']} ({distilbert_result['score']:.4f})")

    return {
        "text": phrase,
        "vader_sentiment": sentiment,
        "vader_compound": vader_scores['compound'],
        "distilbert_label": distilbert_result['label'],
        "distilbert_score": distilbert_result['score']
    }

# Simple version that returns just the compound score (for backward compatibility)
def analyze_phrase(phrase):
    print(f"😀 Starting sentiment analysis...")
    analysis = analyze_phrase_detailed(phrase)
    print(f"📊 Final sentiment score (VADER compound): {analysis['vader_compound']:.4f}")
    return analysis["vader_compound"]

# Print a startup message without loading any models
print("🚀 Audio processing module loaded (models will be loaded on demand)")