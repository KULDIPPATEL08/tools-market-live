import logging
import json
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.ai_model import AIModelRecord

logger = logging.getLogger("scoutboard.ai_radar")

CURATED_AI_MODELS = [
    {
        "name": "Claude 3.5 Sonnet",
        "organization": "Anthropic",
        "release_date": datetime(2024, 6, 20),
        "is_open_weights": False,
        "license": "Proprietary",
        "context_window": 200000,
        "parameter_count": "Proprietary",
        "modalities": "Text, Vision, Code",
        "benchmarks_json": json.dumps({"MMLU": 88.7, "Arena_Elo": 1335, "HumanEval": 93.7, "Math": 78.3}),
        "pricing_input_per_m": 3.00,
        "pricing_output_per_m": 15.00,
        "overview": "Frontier intelligence model leading in software engineering, multi-step agentic reasoning, and visual diagram comprehension.",
        "strengths": "Superior code generation, artifact rendering, nuanced human-like instruction following.",
        "external_url": "https://www.anthropic.com/claude"
    },
    {
        "name": "DeepSeek-V3",
        "organization": "DeepSeek",
        "release_date": datetime(2024, 12, 26),
        "is_open_weights": True,
        "license": "MIT",
        "context_window": 128000,
        "parameter_count": "671B MoE (37B active)",
        "modalities": "Text, Code",
        "benchmarks_json": json.dumps({"MMLU": 88.5, "Arena_Elo": 1310, "HumanEval": 89.2, "Math": 75.9}),
        "pricing_input_per_m": 0.14,
        "pricing_output_per_m": 0.28,
        "overview": "Ultra-efficient open-weights mixture-of-experts model trained with Multi-head Latent Attention (MLA) and DeepSeekMoE architecture.",
        "strengths": "Unprecedented price-to-performance ratio, open MIT license, native multi-token prediction.",
        "external_url": "https://github.com/deepseek-ai/DeepSeek-V3"
    },
    {
        "name": "Llama 3.3 70B Instruct",
        "organization": "Meta",
        "release_date": datetime(2024, 12, 6),
        "is_open_weights": True,
        "license": "Llama 3.3 Community",
        "context_window": 128000,
        "parameter_count": "70B Dense",
        "modalities": "Text, Code",
        "benchmarks_json": json.dumps({"MMLU": 86.9, "Arena_Elo": 1290, "HumanEval": 81.1, "Math": 71.0}),
        "pricing_input_per_m": 0.35,
        "pricing_output_per_m": 0.40,
        "overview": "State-of-the-art open-weights model delivering flagship 405B capabilities inside an accessible 70B parameter footprint.",
        "strengths": "Runs on single dual-GPU workstations, exceptional tool-calling and function synthesis.",
        "external_url": "https://llama.meta.com"
    },
    {
        "name": "Gemini 2.0 Flash Thinking",
        "organization": "Google DeepMind",
        "release_date": datetime(2024, 12, 11),
        "is_open_weights": False,
        "license": "Proprietary",
        "context_window": 1000000,
        "parameter_count": "Proprietary",
        "modalities": "Multimodal (Text, Audio, Video, Code)",
        "benchmarks_json": json.dumps({"MMLU": 89.9, "Arena_Elo": 1345, "HumanEval": 91.5, "Math": 82.1}),
        "pricing_input_per_m": 0.10,
        "pricing_output_per_m": 0.40,
        "overview": "Next-generation multimodal reasoning model featuring real-time thoughts exploration and 1M token context capacity.",
        "strengths": "Unmatched context window, native multimodal audio/video processing, low latency reasoning.",
        "external_url": "https://deepmind.google/technologies/gemini/"
    },
    {
        "name": "Qwen 2.5 72B Instruct",
        "organization": "Alibaba",
        "release_date": datetime(2024, 9, 19),
        "is_open_weights": True,
        "license": "Apache 2.0",
        "context_window": 131072,
        "parameter_count": "72B Dense",
        "modalities": "Text, Code, Multilingual",
        "benchmarks_json": json.dumps({"MMLU": 86.1, "Arena_Elo": 1285, "HumanEval": 86.4, "Math": 80.0}),
        "pricing_input_per_m": 0.30,
        "pricing_output_per_m": 0.35,
        "overview": "Top-tier multilingual foundation model with specialized proficiency in complex mathematics and coding tasks.",
        "strengths": "Apache 2.0 permissive commercial licensing, support for 29+ languages.",
        "external_url": "https://github.com/QwenLM/Qwen2.5"
    },
    {
        "name": "Mistral Large 2",
        "organization": "Mistral AI",
        "release_date": datetime(2024, 7, 24),
        "is_open_weights": True,
        "license": "Mistral Research License",
        "context_window": 128000,
        "parameter_count": "123B",
        "modalities": "Text, Code",
        "benchmarks_json": json.dumps({"MMLU": 84.0, "Arena_Elo": 1260, "HumanEval": 92.0, "Math": 76.8}),
        "pricing_input_per_m": 2.00,
        "pricing_output_per_m": 6.00,
        "overview": "Frontier multilingual model specifically designed for advanced code reasoning and strict JSON schema generation.",
        "strengths": "Exceptional code synthesis across 80+ programming languages.",
        "external_url": "https://mistral.ai"
    }
]

def seed_default_ai_models(db: Session):
    if db.query(AIModelRecord).count() == 0:
        logger.info("Seeding foundational AI model directory...")
        for m in CURATED_AI_MODELS:
            db.add(AIModelRecord(**m))
        db.commit()
