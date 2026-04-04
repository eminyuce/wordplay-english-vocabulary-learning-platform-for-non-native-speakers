import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Language {
    flagEmoji: string;
    code: string;
    name: string;
    createdAt: Time;
    gradientStart: string;
    ordering: bigint;
    textDirection: TextDirection;
    gradientEnd: string;
}
export interface Feedback {
    id: bigint;
    status: FeedbackStatus;
    title: string;
    createdAt: Time;
    authorName?: string;
    message: string;
    category: FeedbackCategory;
    authorPrincipal?: Principal;
}
export interface UserProgress {
    xp: bigint;
    lastPlayed?: Time;
    totalCorrect: bigint;
    streak: bigint;
    principal: Principal;
    badges: Array<string>;
    mostPlayedGameMode: string;
    totalAnswered: bigint;
    totalGames: bigint;
    accuracy: number;
}
export interface GlobalAnalytics {
    totalQuestionsAnswered: bigint;
    averageAccuracy: number;
    totalUsers: bigint;
    totalSessions: bigint;
}
export interface Word {
    id: bigint;
    difficulty: Difficulty;
    languageName: string;
    addedAt: Time;
    foreign: string;
    examples: Array<string>;
    english: string;
}
export interface UserProfile {
    name: string;
    joinedAt: Time;
    preferredLanguages: Array<string>;
}
export interface MotivationalQuote {
    id: bigint;
    createdAt: Time;
    text: string;
}
export enum Difficulty {
    beginner = "beginner",
    advanced = "advanced",
    hard = "hard",
    medium = "medium"
}
export enum DifficultySelector {
    all = "all",
    beginner = "beginner",
    advanced = "advanced",
    hard = "hard",
    medium = "medium"
}
export enum FeedbackCategory {
    bug = "bug",
    idea = "idea",
    issue = "issue"
}
export enum FeedbackStatus {
    pending = "pending",
    completed = "completed"
}
export enum TextDirection {
    ltr = "ltr",
    rtl = "rtl"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addWord(english: string, foreign: string, language: string, difficulty: Difficulty, examples: Array<string>): Promise<void>;
    adminLogin(username: string, password: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkImportLanguages(languageRows: Array<[string, string, string, TextDirection, string, string, bigint]>): Promise<{
        count: bigint;
        errors: Array<string>;
    }>;
    bulkImportWords(wordsToImport: Array<Word>): Promise<{
        count: bigint;
        success: boolean;
    }>;
    createLanguage(name: string, code: string, flag: string, direction: TextDirection, startColor: string, endColor: string, ordering: bigint): Promise<void>;
    createQuote(text: string): Promise<MotivationalQuote>;
    deleteFeedback(id: bigint): Promise<void>;
    deleteQuote(id: bigint): Promise<void>;
    deleteWord(id: bigint): Promise<void>;
    exportWordsCSV(language: string): Promise<Array<[string, string, string, string, string, string]>>;
    exportWordsJSON(language: string): Promise<Array<Word>>;
    getAllFeedback(): Promise<Array<Feedback>>;
    getAllLanguages(): Promise<Array<Language>>;
    getAllQuotes(): Promise<Array<MotivationalQuote>>;
    getAllQuotesPublic(): Promise<Array<MotivationalQuote>>;
    getAllWords(): Promise<Array<Word>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGlobalAnalytics(): Promise<GlobalAnalytics>;
    getLanguagesSorted(): Promise<Array<Language>>;
    getUserAnalytics(principal: Principal): Promise<UserProgress | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWord(id: bigint): Promise<Word | null>;
    getWordsByDifficulty(language: string, difficultySelector: DifficultySelector): Promise<Array<Word>>;
    getWordsCountForLanguage(language: string): Promise<bigint>;
    getWordsForLanguagePage(language: string, offset: bigint, limit: bigint): Promise<Array<Word>>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markFeedbackCompleted(id: bigint): Promise<void>;
    recordGameRound(correctAnswers: bigint, totalQuestions: bigint, gameMode: string): Promise<void>;
    removeLanguage(language: string): Promise<void>;
    removeWordsByLanguage(language: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedInitialLanguages(): Promise<void>;
    submitFeedback(authorPrincipal: Principal | null, authorName: string | null, category: FeedbackCategory, title: string, message: string): Promise<Feedback>;
    updateLanguage(languageName: string, newName: string, newCode: string, newFlag: string, newDirection: TextDirection, newGradientStart: string, newGradientEnd: string, newOrdering: bigint): Promise<void>;
    updateLanguageOrdering(languageName: string, newOrdering: bigint): Promise<void>;
    updateQuote(id: bigint, text: string): Promise<MotivationalQuote>;
    updateWord(id: bigint, english: string, foreign: string, language: string, difficulty: Difficulty, examples: Array<string>): Promise<void>;
}
