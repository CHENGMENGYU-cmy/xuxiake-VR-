import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity.js';

export type DiaryStyle = '温柔治愈风' | '生活碎片风' | '成长复盘风' | '诗意散文风' | '轻松口语风';

export interface SnapMeta {
  keywords?: string[];
  mood?: string;
  scene?: string;
}

export interface GeneratedDiary {
  title: string;
  content: string;
  insight: string;
  tags: string[];
  style: DiaryStyle;
}

@Injectable()
export class DiaryGeneratorService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}

  /** 根据闪拍内容推荐日记风格 */
  recommendStyle(post: Post): DiaryStyle {
    const snapMeta = this.parseSnapMeta(post);
    const text = (post.content || '') + (snapMeta.keywords || []).join('');

    if (/累|疲惫|难过|低落|压力|焦虑/.test(text)) return '温柔治愈风';
    if (/报告|学习|工作|完成|任务|目标/.test(text)) return '成长复盘风';
    if (/天空|傍晚|夜晚|风景|黄昏|日落|云/.test(text)) return '诗意散文风';
    if (/朋友|聊天|开心|聚会|火锅|一起/.test(text)) return '轻松口语风';
    return '生活碎片风';
  }

  /** 生成日记内容 */
  generateDiary(post: Post, style: DiaryStyle, includeMemory = false): GeneratedDiary {
    const snapMeta = this.parseSnapMeta(post);
    const snapText = post.content || '';
    const location = post.locationName || '某个地方';
    const time = post.createdAt ? new Date(post.createdAt).toLocaleString('zh-CN') : '某个时刻';
    const keywords = (snapMeta.keywords || []).join('、') || '日常';

    const memoryText = includeMemory
      ? '\n\n回想起之前也有过类似的时刻，那时候的我还在焦虑，现在却已经能更平静地面对。这样的对比让我意识到，自己其实一直在慢慢往前走。'
      : '';

    switch (style) {
      case '成长复盘风':
        return {
          title: '把今天认真完成',
          content: `今天的记录看起来只是一个普通瞬间：${snapText}\n\n但对我来说，它并不只是简单的一句话。它意味着一件事情终于被推进，也意味着我又一次从混乱和疲惫里，把自己带回了秩序中。\n\n地点是在${location}，时间是${time}。也许以后再回头看，我会忘记今天具体做了什么，但我应该会记得这种终于完成后的轻松感。${memoryText}\n\n今天没有什么惊天动地的大事，但我完成了一件需要耐心的事。这本身就值得被记录。`,
          insight: '认真完成一件小事，也是在给自己建立信心。',
          tags: ['成长记录', '今日完成', '学习工作'],
          style,
        };

      case '温柔治愈风':
        return {
          title: '今天也慢慢过去了',
          content: `今天的我有一点累。${snapText}\n\n有时候，生活并不会因为某个瞬间突然变好，但一些细小的完成、一些短暂的安静，还是会让人觉得自己没有白白度过这一天。\n\n我在${location}留下了这条记录。那一刻的情绪并不复杂，只是疲惫里带着一点点松动。${memoryText}\n\n也许今天不算完美，但我已经尽力了。能这样把它写下来，也算是温柔地接住了自己。`,
          insight: '不是每一天都要闪闪发光，能安稳度过也很好。',
          tags: ['温柔日记', '情绪记录', '自我陪伴'],
          style,
        };

      case '诗意散文风':
        return {
          title: '把这一刻留给风',
          content: `今天的画面有一种安静的美。${snapText}\n\n时间停在${time}，地点是${location}。也许只是一个很普通的瞬间，但当它被记录下来，就像被轻轻放进了记忆的抽屉里。\n\n那些关键词——${keywords}，像是这一天留下的几个小小注脚。${memoryText}\n\n我想，日子之所以值得被写下，并不是因为它总是特别，而是因为某一刻的我，真的在认真感受它。`,
          insight: '普通的一刻，被认真看见后，也会变得特别。',
          tags: ['诗意日记', '生活观察', '今日风景'],
          style,
        };

      case '轻松口语风':
        return {
          title: '今天还挺不错的',
          content: `今天发生了一件让我想记下来的小事：${snapText}\n\n其实它不一定有多重要，但就是让人觉得，这一天突然变得鲜活了一点。尤其是在${location}的那个时候，心情是很真实的。\n\n关键词是${keywords}，看起来就很像今天的我本人。${memoryText}\n\n总之，今天不算白过。能有这样的瞬间，就已经很值得。`,
          insight: '快乐有时候不用很大，一点点就够了。',
          tags: ['日常记录', '开心瞬间', '朋友日记'],
          style,
        };

      default: // 生活碎片风
        return {
          title: '今天的小小记录',
          content: `今天留下了一条闪拍：${snapText}\n\n它可能只是生活里很普通的一幕，但我还是想把它写下来。因为很多时候，真正组成生活的，并不是那些特别大的事件，而是这些细碎、真实、容易被忘记的小瞬间。\n\n这条记录发生在${location}，时间是${time}。关键词是${keywords}。${memoryText}\n\n以后再看到这篇日记时，我应该会想起今天的自己，也想起这个普通但真实的片刻。`,
          insight: '生活不是由大事组成的，而是由一个个被看见的瞬间组成的。',
          tags: ['生活碎片', '今日小记', '日常日记'],
          style,
        };
    }
  }

  /** 寻找回忆反差：根据关键词找用户历史日记 */
  async findMemoryContrast(userId: string, currentKeywords: string[]): Promise<Post | null> {
    if (!currentKeywords || currentKeywords.length === 0) return null;

    const diaries = await this.postRepo.find({
      where: { authorId: userId, contentLevel: 'DIARY' },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    for (const diary of diaries) {
      const meta = this.parseSnapMeta(diary);
      const diaryKeywords = meta.keywords || [];
      const hasOverlap = currentKeywords.some(kw => diaryKeywords.includes(kw));
      if (hasOverlap) return diary;
    }

    return null;
  }

  private parseSnapMeta(post: Post): SnapMeta {
    try {
      if (post.vrMetadata) {
        return typeof post.vrMetadata === 'string'
          ? JSON.parse(post.vrMetadata)
          : post.vrMetadata;
      }
    } catch { /* ignore */ }
    return {};
  }
}
