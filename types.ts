
export interface StudentProfile {
  name: string;
  avatar?: string;
  marks: number;
  accuracy: number;
  timeTaken: number;
  iq: number;
  assignments: string[]; // URLs of captured images
  faceData?: string; // Base64 of registered face
}

export enum AppScreen {
  LOGIN = 'login',
  REGISTER = 'register',
  FACE_REGISTER = 'face_register',
  FACE_LOGIN = 'face_login',
  HOME = 'home',
  MAGIC_MENU = 'magic_menu',
  OBJECT_DETECT = 'object_detect',
  SPEECH_GUESS = 'speech_guess',
  EMOTION_CHECK = 'emotion_check',
  MAGIC_DRAW = 'magic_draw',
  HOMEWORK_HELPER = 'homework_helper',
  SPEECH_CORRECTION = 'speech_correction',
  WRITING_CORRECTION = 'writing_correction',
  LESSONS = 'lessons',
  GAMES_HUB = 'games_hub',
  GAME_MATCH = 'game_match',
  GAME_POP = 'game_pop',
  GRAND_TEST = 'grand_test',
  FEEDBACK = 'feedback',
  REPORT_CARD = 'report_card',
  EDUCATOR_LOGIN = 'educator_login',
  EDUCATOR_DASHBOARD = 'educator_dashboard',
  CREATE_LESSON = 'create_lesson',
  MANAGE_EXAMS = 'manage_exams',
  VIEW_REPORTS = 'view_reports'
}

export interface Lesson {
  id: number;
  title: string;
  type: 'alphabet' | 'words' | 'number' | 'number_words' | 'colors' | 'emotion' | 'object';
  status: 'locked' | 'available' | 'completed';
}
