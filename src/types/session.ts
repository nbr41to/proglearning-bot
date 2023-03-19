export type RoomSession = {
  slack_timestamp: string;
  joined_learning_channel_member_ids: string[];
  joined_muted_channel_member_ids: string[];
  created_at: Date;
  discord_learning_personal_sessions: PersonalSession[];
};

export type RoomSessionCreateInput = {
  slack_timestamp: string;
  joined_learning_channel_member_ids: string[];
  joined_muted_channel_member_ids: string[];
  created_at: Date;
  discord_learning_personal_sessions: [
    Omit<PersonalSessionCreateInput, 'slack_timestamp'>,
  ];
};

export type RoomSessionUpdateInput = Partial<Omit<RoomSession, 'created_at'>>;

export type PersonalSession = {
  id: number;
  slack_timestamp: string;
  discord_id: string;
  joined_at: Date;
  left_at?: Date;
  total_ms?: number;
};

export type PersonalSessionCreateInput = Omit<
  PersonalSession,
  'id' | 'left_at' | 'total_ms'
>;

export type PersonalSessionUpdateInput = Partial<
  Omit<PersonalSession, 'slack_timestamp' | 'discord_id'>
>;
