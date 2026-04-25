interface UserProfile {
  user_id: string;
  birth_info: {
    name: string;
    birth_date: string;
    birth_time?: string;
    gender: string;
    saju?: {
      day_pillar: string;
      monthly_flow: string;
      risk_signal: string;
      recommendation_code: string;
    };
  };
}
