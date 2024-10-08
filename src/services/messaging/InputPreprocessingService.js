// src/services/messaging/InputPreprocessingService.js

const { LLMChain } = require("langchain/chains");
const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const logger = require('../../utils/logger');

class InputPreprocessingService {
  constructor() {
    this.llm = new ChatOpenAI({ temperature: 0 });
    this.preprocessChain = new LLMChain({
      llm: this.llm,
      prompt: PromptTemplate.fromTemplate(
        "Preprocess the following text for NLP tasks. Remove stopwords, perform stemming, and normalize the text:\n\n{text}\n\nPreprocessed text:"
      ),
    });
  }

  async preprocess(text) {
    logger.info('Preprocessing input text with LangChain');
    try {
      const result = await this.preprocessChain.call({ text });
      logger.info('Input preprocessing completed');
      return result.text.trim();
    } catch (error) {
      logger.error('Error during input preprocessing:', error);
      throw error;
    }
  }

  async cleanInput(text) {
    logger.info('Cleaning input text');
    try {
      let cleanedText = text.trim().replace(/\s+/g, ' ')
                            .replace(/<[^>]*>/g, '')
                            .replace(/https?:\/\/\S+/g, '')
                            .replace(/[\u{1F600}-\u{1F64F}]/gu, '');

      logger.info('Input cleaning completed');
      return cleanedText;
    } catch (error) {
      logger.error('Error during input cleaning:', error);
      throw error;
    }
  }
}

module.exports = new InputPreprocessingService();