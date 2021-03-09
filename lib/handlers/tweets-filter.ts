import _ from 'lodash';
import { ExtendedTweet } from '../shared-types/enteded-tweet';

export enum FilterMode {
  MEDIA = 'MEDIA',
  NO_MEDIA = 'NO_MEDIA',
  NO_OP = 'NO_OP',
}

interface Filterer {
  doesPass(tweet: ExtendedTweet): boolean
}

export const queryKey = 'filter_mode';

const NoOpFilterer: Filterer = {
  doesPass: _ => true
}

class MediaFilterer implements Filterer {
  doesPass(tweet: ExtendedTweet): boolean {
    return this.hasMedia(tweet);
  }

  hasMedia(tweet: ExtendedTweet): boolean {
    if (!tweet) return false;
    return !!tweet?.extended_entities?.media || this.hasMedia(tweet?.in_reply_to_tweet);
  }
}

class NegationFilterer implements Filterer {
  innerFilterer: Filterer

  constructor(innerFilterer: Filterer) {
    this.innerFilterer = innerFilterer;
  }

  doesPass(tweet: ExtendedTweet): boolean {
    return !this.innerFilterer.doesPass(tweet);
  }
}

export default class TweetsFilter {

  static instance: TweetsFilter;

  static filterMap = {
    [FilterMode.MEDIA]: new MediaFilterer(),
    [FilterMode.NO_MEDIA]: new NegationFilterer(new MediaFilterer()),
    [FilterMode.NO_OP]: NoOpFilterer,
  }

  static filterByMode(mode: FilterMode, tweets: ExtendedTweet[]): ExtendedTweet[] {
    const filterInstance = TweetsFilter.filterMap[mode];
    return _.filter(tweets, filterInstance.doesPass.bind(filterInstance));
  }

  static filterByPossibleMode(possibleMode: string, tweets: ExtendedTweet[]): ExtendedTweet[] {
    const ModeIndex: { [idx: string]: FilterMode; } = <any>FilterMode;
    const enumVal = ModeIndex[possibleMode] || FilterMode.NO_OP;
    return TweetsFilter.filterByMode(enumVal, tweets);
  }

}
