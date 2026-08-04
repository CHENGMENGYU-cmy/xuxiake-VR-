import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiGenerateOptions {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

@Injectable()
export class AiClientService {
  constructor(private readonly config: ConfigService) {}

  async generate(options: AiGenerateOptions): Promise<string> {
    const provider = this.config.get<string>('AI_PROVIDER', 'deepseek');
    const apiKey = this.config.get<string>('AI_API_KEY', '');
    const model = this.config.get<string>('AI_MODEL', 'deepseek-chat');
    const baseUrl = this.config.get<string>('AI_BASE_URL', 'https://api.deepseek.com/v1');

    if (!apiKey) {
      throw new Error('AI_API_KEY 未配置，请在 .env 中设置');
    }

    const url = `${baseUrl}/chat/completions`;
    const timeout = options.timeout || 120000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.8,
          max_tokens: options.maxTokens ?? 4096,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`AI 调用失败 [${res.status}]: ${errText.slice(0, 200)}`);
      }

      const json: any = await res.json();
      const content = json?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`AI 返回内容为空: ${JSON.stringify(json).slice(0, 200)}`);
      }

      // 记录消耗
      const usage = json.usage;
      if (usage) {
        console.log(`[AI] tokens: prompt=${usage.prompt_tokens} completion=${usage.completion_tokens} total=${usage.total_tokens}`);
      }

      return content;
    } finally {
      clearTimeout(timer);
    }
  }
}
