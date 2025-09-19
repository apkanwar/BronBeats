export type VimeoPictureSize = {
  width?: number;
  height?: number;
  link?: string;
};

export type VimeoTag = {
  tag: string;
};

export type VimeoUser = {
  name?: string;
  link?: string;
};

export type FetchVimeoVideo = {
  uri: string;
  name?: string;
  description?: string;
  link?: string;
  created_time?: string;
  duration?: number;
  pictures?: {
    sizes?: VimeoPictureSize[];
  };
  tags?: VimeoTag[];
  user?: VimeoUser;
};

export type VimeoAPIResponse = {
  data: FetchVimeoVideo[];
  paging?: {
    next?: string;
  };
};
