import {parsePostMeta} from './user';

export const numberWithCommas = x =>
  String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function allowDelete(comment: Post | Feed) {
  const hasPayout = comment.cashout_time === 0;
  const hasUpvotes = !(
    comment.upvote_count === 0 && comment.downvote_count === 0
  );
  const hasChildren = comment.children !== 0;
  return !(hasPayout || hasChildren || hasUpvotes);
}

export function normalizeTags(metadata, category: string) {
  let tags: any[] = [];

  try {
    tags = (metadata && metadata.toJS().tags) || [];
    //if (typeof tags == 'string') tags = [tags];
    if (!Array.isArray(tags)) tags = [];
  } catch (e) {
    tags = [];
  }

  tags.unshift(category);

  return filterTags(tags);
}

export function parseJsonTags(post) {
  return normalizeTags(post['json_metadata'], post['category']);
}

export function hasNsfwTag(content: Feed | Post) {
  const nsfwRegex = /\b(nsfw|adult|explicit|fuck|dick|anal|cock|penis|ass)\b/i; // Add more NSFW words here
  const parsed = parsePostMeta(content.json_metadata);
  return nsfwRegex.test(
    content.title?.toLowerCase() + JSON.stringify(parsed.tags),
  );
}

export function filterTags(tags) {
  return tags
    .filter(tag => typeof tag === 'string')
    .filter((value, index, self) => value && self.indexOf(value) === index);
}
