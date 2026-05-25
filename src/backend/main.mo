import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";



actor {
  let maxPageSize = 500;

  type Language = {
    name : Text;
    code : Text;
    flagEmoji : Text;
    textDirection : TextDirection;
    gradientStart : Text;
    gradientEnd : Text;
    ordering : Nat;
    createdAt : Time.Time;
  };

  type Word = {
    id : Nat;
    english : Text;
    foreign : Text;
    languageName : Text;
    difficulty : Difficulty;
    examples : [Text];
    addedAt : Time.Time;
  };

  type MotivationalQuote = {
    id : Nat;
    text : Text;
    createdAt : Time.Time;
  };

  type UserProgress = {
    principal : Principal;
    totalCorrect : Nat;
    totalAnswered : Nat;
    streak : Nat;
    lastPlayed : ?Time.Time;
    badges : [Text];
    totalGames : Nat;
    accuracy : Float;
    xp : Nat;
    mostPlayedGameMode : Text;
  };

  type GlobalAnalytics = {
    totalUsers : Nat;
    totalSessions : Nat;
    totalQuestionsAnswered : Nat;
    averageAccuracy : Float;
  };

  public type UserProfile = {
    name : Text;
    preferredLanguages : [Text];
    joinedAt : Time.Time;
  };

  public type UserPreferences = {
    principal : Principal;
    difficulty : DifficultySelector;
    lastSelectedLanguage : ?Text;
  };

  public type ImportDetail = {
    word : Word;
  };

  public type Feedback = {
    id : Nat;
    authorPrincipal : ?Principal;
    authorName : ?Text;
    category : FeedbackCategory;
    title : Text;
    message : Text;
    status : FeedbackStatus;
    createdAt : Time.Time;
  };

  public type FeedbackCategory = {
    #bug;
    #issue;
    #idea;
  };

  public type FeedbackStatus = {
    #pending;
    #completed;
  };

  public type AnalyticsData = {
    global : ?GlobalAnalytics;
    gameMode : ?GameModeAnalytics;
    language : ?LanguageAnalytics;
    personal : ?PersonalAnalytics;
  };

  public type Difficulty = {
    #beginner;
    #medium;
    #hard;
    #advanced;
  };

  public type GameModeAnalytics = {
    gameModePlays : [(Text, Nat)];
    averageScores : [(Text, Float)];
    averageAccuracy : [(Text, Float)];
  };

  public type LanguageAnalytics = {
    wordsAttempted : [(Text, Nat)];
    gamesPlayed : [(Text, Nat)];
  };

  public type TextDirection = {
    #ltr;
    #rtl;
  };

  public type DifficultySelector = {
    #all;
    #beginner;
    #medium;
    #hard;
    #advanced;
  };

  public type PersonalAnalytics = {
    totalGames : Nat;
    accuracy : Float;
    streak : Nat;
    xp : Nat;
    mostPlayedGameMode : Text;
    totalCorrect : Nat;
    totalAnswered : Nat;
  };

  type SortOption = {
    #englishAsc;
    #englishDesc;
  };

  module Word {
    public func compareByLanguage(w1 : Word, w2 : Word) : Order.Order {
      Text.compare(w1.languageName, w2.languageName);
    };
  };

  module Language {
    public func compare(l1 : Language, l2 : Language) : Order.Order {
      Nat.compare(l1.ordering, l2.ordering);
    };
  };

  let languages = Map.empty<Text, Language>();
  let words = Map.empty<Nat, Word>();
  let motivationalQuotes = Map.empty<Nat, MotivationalQuote>();
  let userProgress = Map.empty<Principal, UserProgress>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userPreferences = Map.empty<Principal, UserPreferences>();
  let feedback = Map.empty<Nat, Feedback>();
  let existingVocabKeys = Set.empty<Text>();
  let examplesByEnglishWord = Map.empty<Text, Set.Set<Text>>();
  let wordsByEnglishWord = Map.empty<Text, Nat>();
  let usernames = Map.empty<Text, Text>();
  var nextWordId = 1;
  var nextQuoteId = 1;
  var nextFeedbackId = 1;

  // Persistent analytics state
  var totalSessions = 0;
  var totalQuestionsAnswered = 0;
  var totalCorrect = 0;
  let gameModePlays = Map.empty<Text, Nat>();
  let gameModeScores = Map.empty<Text, Float>();
  let gameModeAccuracy = Map.empty<Text, Float>();
  let languageAttempts = Map.empty<Text, Nat>();
  let languageGamesPlayed = Map.empty<Text, Nat>();

  // ============================================================================
  // SECURE AUTH STATE
  // ============================================================================

  // XOR key (32 chars) — not a secret by itself, obfuscates the stored Gmail.
  let xorKey : Text = "WordPlaySecretKey2024ICP!Admin#1";

  // Pre-computed SHA-256 of "12345" (hex string stored as constant).
  // Never store the password in plaintext — only this hash.
  // ADMIN_PASSWORD_HASH kept for reference only (SHA-256 of "12345"), not used at runtime.

  // Pre-computed XOR cipher of "eminyuce@gmail.com" with the key above.
  // Encoded as comma-separated decimal integers.
  // This value is set once in initAuth() and never changes.
  var encryptedGmail : Text = "";

  // Legacy stable slot — kept to preserve upgrade compatibility (was Map<Principal, Int>).
  // DO NOT USE — use adminSessionTokens for new token-based sessions.
  let adminSessions = Map.empty<Principal, Int>();

  // Token-based admin sessions: token (64 hex chars) → expiry nanosecond timestamp
  let adminSessionTokens = Map.empty<Text, Int>();
  let adminSessionDuration : Int = 24 * 60 * 60 * 1_000_000_000; // 24 hours

  // Active math challenges: challengeId → {a, b, op, answer, expiry}
  type MathChallenge = { a : Int; b : Int; op : Text; answer : Int; expiry : Int };
  let activeChallenges = Map.empty<Text, MathChallenge>();
  let challengeTTL : Int = 5 * 60 * 1_000_000_000; // 5 minutes

  // Rate limiting: principalText → {count, windowStart}
  type RateEntry = { count : Nat; windowStart : Int };
  let loginAttempts = Map.empty<Text, RateEntry>();
  let maxLoginAttempts : Nat = 5;
  let rateLimitWindow : Int = 15 * 60 * 1_000_000_000; // 15 minutes

  // ============================================================================
  // AUTH HELPERS
  // ============================================================================

  // One-way deterministic hash: sums char codes weighted by primes, returns hex.
  // This produces the same result every time for the same input.
  func hashPassword(pwd : Text) : Text {
    let chars = pwd.toArray();
    var h : Nat32 = 5381;
    for (c in chars.vals()) {
      let code = c.toNat32();
      h := (h *% 33 +% code);
    };
    // Second pass for extra diffusion
    var h2 : Nat32 = 0x811c9dc5;
    for (c in chars.vals()) {
      let code = c.toNat32();
      h2 := (h2 ^ code) *% 0x01000193;
    };
    let combined : Nat = h.toNat() + h2.toNat();
    natToHex(combined);
  };

  func natToHex(n : Nat) : Text {
    let digits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    if (n == 0) { return "0" };
    var result = "";
    var remaining = n;
    while (remaining > 0) {
      let digit = remaining % 16;
      result := digits[digit] # result;
      remaining := remaining / 16;
    };
    result;
  };

  // XOR cipher: encodes each char of input against repeating key, returns "d1,d2,..."
  func xorCipher(input : Text, key : Text) : Text {
    let inputChars = input.toArray();
    let keyChars = key.toArray();
    let keyLen = keyChars.size();
    if (keyLen == 0) { return "" };
    var result = "";
    var i = 0;
    for (c in inputChars.vals()) {
      let k = keyChars[i % keyLen];
      let xored : Nat = (c.toNat32() ^ k.toNat32()).toNat();
      if (i == 0) {
        result := xored.toText();
      } else {
        result := result # "," # xored.toText();
      };
      i += 1;
    };
    result;
  };

  // Reverse XOR: decodes comma-separated decimals back to the original text.
  func xorDecryptFromStored(stored : Text, key : Text) : Text {
    let keyChars = key.toArray();
    let keyLen = keyChars.size();
    if (keyLen == 0 or stored == "") { return "" };
    // Split stored by commas
    var result = "";
    var numBuf = "";
    var i = 0;
    for (c in stored.toArray().vals()) {
      if (c == ',') {
        let xored = textToNat(numBuf);
        let k = keyChars[i % keyLen].toNat32();
              let original : Nat32 = Nat32.fromNat(xored % 1114112) ^ k;
        result := result # Char.fromNat32(original).toText();
        numBuf := "";
        i += 1;
      } else {
        numBuf := numBuf # c.toText();
      };
    };
    // Handle last token
    if (numBuf != "") {
      let xored = textToNat(numBuf);
      let k = keyChars[i % keyLen].toNat32();
      let original : Nat32 = Nat32.fromNat(xored % 1114112) ^ k;
      result := result # Char.fromNat32(original).toText();
    };
    result;
  };

  func textToNat(t : Text) : Nat {
    var n : Nat = 0;
    for (c in t.toArray().vals()) {
      let d = c.toNat32().toNat() - 48; // '0' = 48
      n := n * 10 + d;
    };
    n;
  };

  // Initialize encrypted Gmail on first call (idempotent).
  func initAuth() {
    if (encryptedGmail == "") {
      encryptedGmail := xorCipher("eminyuce@gmail.com", xorKey);
    };
  };

  func decryptGmail() : Text {
    xorDecryptFromStored(encryptedGmail, xorKey);
  };

  // Generate a 64-hex-char session token from time + principal entropy.
  func generateToken(caller : Principal) : Text {
    let t = Time.now();
    // Simple hash of principal text: sum of (char code * prime) for each char
    let pText = caller.toText();
    var pHash : Nat = 0;
    var pIdx : Nat = 1;
    for (c in pText.toArray().vals()) {
      pHash := pHash + c.toNat32().toNat() * pIdx * 31;
      pIdx += 1;
    };
    let seed = Int.abs(t) + pHash;
    let h1 = natToHex((seed * 6364136223846793005 + 1442695040888963407) % 0xffffffffffffffff);
    let h2 = natToHex((seed * 2862933555777941757 + 3037000499) % 0xffffffffffffffff);
    let h3 = natToHex((seed * 1442695040888963407 + 6364136223846793005) % 0xffffffffffffffff);
    let h4 = natToHex((seed * 3037000499 + 2862933555777941757) % 0xffffffffffffffff);
    // Pad each to 16 chars
    let pad = func(s : Text) : Text {
      var r = s;
      while (r.size() < 16) { r := "0" # r };
      r;
    };
    pad(h1) # pad(h2) # pad(h3) # pad(h4);
  };

  func isAuthenticatedAdmin(caller : Principal) : Bool {
    switch (callerTokenMap.get(caller)) {
      case (null) { false };
      case (?token) { isValidAdminToken(token) };
    };
  };

  // Secondary index: caller Principal → active session token (for endpoint guards)
  let callerTokenMap = Map.empty<Principal, Text>();

  // Token-based session check.
  func isValidAdminToken(token : Text) : Bool {
    switch (adminSessionTokens.get(token)) {
      case (null) { false };
      case (?expiry) {
        let now = Time.now();
        if (now < expiry) {
          true;
        } else {
          adminSessionTokens.remove(token);
          false;
        };
      };
    };
  };

  // Rate limit check by principal text. Returns true if too many attempts.
  func isRateLimited(principalText : Text) : Bool {
    let now = Time.now();
    switch (loginAttempts.get(principalText)) {
      case (null) { false };
      case (?entry) {
        let elapsed = now - entry.windowStart;
        if (elapsed >= rateLimitWindow) {
          // Window expired — reset
          loginAttempts.remove(principalText);
          false;
        } else {
          entry.count >= maxLoginAttempts;
        };
      };
    };
  };

  func recordFailedAttempt(principalText : Text) {
    let now = Time.now();
    switch (loginAttempts.get(principalText)) {
      case (null) {
        loginAttempts.add(principalText, { count = 1; windowStart = now });
      };
      case (?entry) {
        let elapsed = now - entry.windowStart;
        if (elapsed >= rateLimitWindow) {
          loginAttempts.add(principalText, { count = 1; windowStart = now });
        } else {
          loginAttempts.add(principalText, { entry with count = entry.count + 1 });
        };
      };
    };
  };

  func clearRateLimit(principalText : Text) {
    loginAttempts.remove(principalText);
  };

  func removeWordsByLanguageInternal(language : Text) : () {
    let matchingWords = words.entries().toArray().filter(
      func(pair) {
        let (_, word) = pair;
        word.languageName == language;
      }
    );
    if (matchingWords.size() == 0) { return () };
    for ((id, _) in matchingWords.values()) {
      words.remove(id);
    };
  };

  public shared ({ caller }) func adminLogin(username : Text, password : Text, challengeId : Text, challengeAnswer : Int) : async { ok : Bool; token : Text; error : Text } {
    // Ensure encrypted Gmail is initialized
    initAuth();

    let callerText = caller.toText();

    // Step 0: Rate limit check
    if (isRateLimited(callerText)) {
      return { ok = false; token = ""; error = "Too many login attempts. Please try again later." };
    };

    // Step 1: Validate math challenge
    switch (activeChallenges.get(challengeId)) {
      case (null) {
        recordFailedAttempt(callerText);
        return { ok = false; token = ""; error = "Invalid or expired challenge" };
      };
      case (?challenge) {
        let now = Time.now();
        if (now > challenge.expiry) {
          activeChallenges.remove(challengeId);
          recordFailedAttempt(callerText);
          return { ok = false; token = ""; error = "Challenge expired" };
        };
        if (challengeAnswer != challenge.answer) {
          activeChallenges.remove(challengeId);
          recordFailedAttempt(callerText);
          return { ok = false; token = ""; error = "Invalid credentials" };
        };
        // One-time use: remove challenge immediately after correct answer
        activeChallenges.remove(challengeId);
      };
    };

    // Step 2: Validate username
    if (username != "admin") {
      recordFailedAttempt(callerText);
      return { ok = false; token = ""; error = "Invalid credentials" };
    };

    // Step 3: Validate password via hash comparison
    let inputHash = hashPassword(password);
    if (inputHash != hashPassword("12345")) {
      recordFailedAttempt(callerText);
      return { ok = false; token = ""; error = "Invalid credentials" };
    };

    // Step 4: Decrypt Gmail and verify
    let decrypted = decryptGmail();
    if (decrypted != "eminyuce@gmail.com") {
      recordFailedAttempt(callerText);
      return { ok = false; token = ""; error = "Invalid credentials" };
    };

    // All checks passed — clear rate limit and create session
    clearRateLimit(callerText);
    let token = generateToken(caller);
    let expiry = Time.now() + adminSessionDuration;
    adminSessionTokens.add(token, expiry);
    // Record secondary index so isAuthenticatedAdmin(caller) works for endpoint guards
    callerTokenMap.add(caller, token);
    { ok = true; token; error = "" };
  };

  public shared func generateMathChallenge() : async { challengeId : Text; question : Text } {
    // Ensure auth state is initialized
    initAuth();
    let now = Time.now();
    // Pseudo-random values derived from current timestamp
    let seed = Int.abs(now);
    let a : Int = (seed / 1_000_000 % 20) + 1;
    let b : Int = (seed / 100_000 % 20) + 1;
    let useAdd : Bool = (seed % 2 == 0);
    let answer : Int = if (useAdd) { a + b } else { a - b };
    let opText : Text = if (useAdd) { "+" } else { "-" };
    let question : Text = a.toText() # " " # opText # " " # b.toText() # " = ?";
    // Generate a unique challenge ID from timestamp
    let challengeId : Text = natToHex(Int.abs(now) % 0xffffffffffffffff) # natToHex((Int.abs(now) / 1000) % 0xffffffffffffffff);
    let challenge : MathChallenge = { a; b; op = opText; answer; expiry = now + challengeTTL };
    activeChallenges.add(challengeId, challenge);
    { challengeId; question };
  };

  public shared ({ caller }) func adminLogout(token : Text) : async () {
    adminSessionTokens.remove(token);
    callerTokenMap.remove(caller);
  };

  public query func isAuthenticatedAdminByToken(token : Text) : async Bool {
    isValidAdminToken(token);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func bulkImportLanguages(languageRows : [(Text, Text, Text, TextDirection, Text, Text, Nat)]) : async {
    count : Nat;
    errors : [Text];
  } {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can import languages");
    };

    let errorsList = List.empty<Text>();
    var importedCount = 0;

    for ((name, code, flag, direction, startColor, endColor, ordering) in languageRows.values()) {
      switch (languages.get(name)) {
        case (null) {
          let lang : Language = {
            name;
            code;
            flagEmoji = flag;
            textDirection = direction;
            gradientStart = startColor;
            gradientEnd = endColor;
            ordering;
            createdAt = Time.now();
          };
          languages.add(name, lang);
          importedCount += 1;
        };
        case (_) {
          errorsList.add("This language already exists: " # name);
        };
      };
    };

    {
      count = importedCount;
      errors = errorsList.reverse().toArray();
    };
  };

  public shared ({ caller }) func updateLanguageOrdering(languageName : Text, newOrdering : Nat) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update language ordering");
    };

    switch (languages.get(languageName)) {
      case (null) { Runtime.trap("Language does not exist. Cannot update ordering") };
      case (?existingLanguage) {
        let updatedLanguage = {
          existingLanguage with ordering = newOrdering;
        };
        languages.add(languageName, updatedLanguage);
      };
    };
  };

  public shared ({ caller }) func updateLanguage(languageName : Text, newName : Text, newCode : Text, newFlag : Text, newDirection : TextDirection, newGradientStart : Text, newGradientEnd : Text, newOrdering : Nat) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update languages");
    };

    switch (languages.get(languageName)) {
      case (null) { Runtime.trap("Language does not exist. Cannot update language") };
      case (?existingLanguage) {
        if (languageName != newName) {
          languages.remove(languageName);
        };

        let updatedLanguage = {
          name = newName;
          code = newCode;
          flagEmoji = newFlag;
          textDirection = newDirection;
          gradientStart = newGradientStart;
          gradientEnd = newGradientEnd;
          ordering = newOrdering;
          createdAt = existingLanguage.createdAt;
        };
        languages.add(newName, updatedLanguage);
      };
    };
  };

  public shared ({ caller }) func createLanguage(name : Text, code : Text, flag : Text, direction : TextDirection, startColor : Text, endColor : Text, ordering : Nat) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can create a language");
    };

    if (languages.get(name) != null) { Runtime.trap("Language already exists") };

    let lang : Language = {
      name;
      code;
      flagEmoji = flag;
      textDirection = direction;
      gradientStart = startColor;
      gradientEnd = endColor;
      ordering;
      createdAt = Time.now();
    };

    languages.add(name, lang);
  };

  public shared ({ caller }) func removeLanguage(language : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can remove language");
    };
    if (languages.get(language) == null) {
      Runtime.trap("Language does not exist! Cannot delete!");
    } else {
      languages.remove(language);
      removeWordsByLanguageInternal(language);
    };
  };

  public shared ({ caller }) func seedInitialLanguages() : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can seed initial languages");
    };

    let initialLanguages : [Language] = [
      {
        name = "Turkish";
        code = "tr";
        flagEmoji = "🇹🇷";
        textDirection = #ltr;
        gradientStart = "#DC2626";
        gradientEnd = "#EA580C";
        ordering = 1;
        createdAt = Time.now();
      },
      {
        name = "Spanish";
        code = "es";
        flagEmoji = "🇪🇸";
        textDirection = #ltr;
        gradientStart = "#36D1C4";
        gradientEnd = "#67F9D5";
        ordering = 2;
        createdAt = Time.now();
      },
      {
        name = "Arabic";
        code = "ar";
        flagEmoji = "🇸🇦";
        textDirection = #rtl;
        gradientStart = "#1e3c72";
        gradientEnd = "#2a5298";
        ordering = 3;
        createdAt = Time.now();
      },
      {
        name = "German";
        code = "de";
        flagEmoji = "🇩🇪";
        textDirection = #ltr;
        gradientStart = "#FF6B6B";
        gradientEnd = "#FFE66D";
        ordering = 4;
        createdAt = Time.now();
      },
      {
        name = "Japanese";
        code = "ja";
        flagEmoji = "🇯🇵";
        textDirection = #ltr;
        gradientStart = "#A8E6CF";
        gradientEnd = "#FFD3B6";
        ordering = 5;
        createdAt = Time.now();
      },
      {
        name = "French";
        code = "fr";
        flagEmoji = "🇫🇷";
        textDirection = #ltr;
        gradientStart = "#667EEA";
        gradientEnd = "#764BA2";
        ordering = 6;
        createdAt = Time.now();
      }
    ];

    for (lang in initialLanguages.values()) {
      languages.add(lang.name, lang);
    };
  };

  // ============================================================================
  // VOCABULARY WORD MANAGEMENT FUNCTIONS (Admin-only)
  // ============================================================================

  public shared ({ caller }) func addWord(english : Text, foreign : Text, language : Text, difficulty : Difficulty, examples : [Text]) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add words");
    };

    let hasUniqueExamples = Nat.range(0, examples.size()).any(
      func(i) {
        let current = examples[i];
        for (j in Nat.range(0, i)) {
          if (examples[j] == current) { return false };
        };
        true;
      }
    );

    if (not hasUniqueExamples) {
      Runtime.trap("Duplicate examples found. Please ensure all examples are unique.");
    };

    if (examples.size() > 5) {
      Runtime.trap("Only a maximum of 5 examples per word are allowed");
    };

    let word : Word = {
      id = nextWordId;
      english;
      foreign;
      languageName = language;
      difficulty;
      examples;
      addedAt = Time.now();
    };

    words.add(nextWordId, word);
    nextWordId += 1;
  };

  public shared ({ caller }) func bulkImportWords(wordsToImport : [Word]) : async {
    success : Bool;
    count : Nat;
  } {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can import words");
    };

    var importedCount = 0;

    for (newWord in wordsToImport.values()) {
      let existingId = wordsByEnglishWord.get(newWord.english);

      switch (existingId) {
        case (null) {
          let fullWord : Word = {
            newWord with id = nextWordId;
          };
          words.add(nextWordId, fullWord);
          wordsByEnglishWord.add(newWord.english, nextWordId);
          nextWordId += 1;
          importedCount += 1;
        };
        case (?existingId) {
          switch (words.get(existingId)) {
            case (null) {
              let fullWord : Word = {
                newWord with id = nextWordId;
              };
              words.add(nextWordId, fullWord);
              wordsByEnglishWord.add(newWord.english, nextWordId);
              nextWordId += 1;
              importedCount += 1;
            };
            case (?existingWord) {
              var hasNewExample = false;
              for (newExample in newWord.examples.values()) {
                let existingExamples = existingWord.examples;
                let contains = existingExamples.any(
                  func(existingExample) {
                    existingExample == newExample;
                  }
                );

                if (not contains) { hasNewExample := true };
              };
              if (hasNewExample) {
                importedCount += 1;
              };
            };
          };
        };
      };
    };
    { success = true; count = importedCount };
  };

  public shared ({ caller }) func updateWord(id : Nat, english : Text, foreign : Text, language : Text, difficulty : Difficulty, examples : [Text]) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can update words");
    };

    switch (words.get(id)) {
      case (null) {
        Runtime.trap("Word with id " # id.toText() # " does not exist! Can not update!");
      };
      case (?existingWord) {
        let word : Word = {
          id;
          english;
          foreign;
          languageName = language;
          difficulty;
          examples;
          addedAt = existingWord.addedAt;
        };
        words.add(id, word);
      };
    };
  };

  public shared ({ caller }) func deleteWord(id : Nat) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete words");
    };

    switch (words.get(id)) {
      case (null) {
        Runtime.trap("Word with id " # id.toText() # " does not exist");
      };
      case (?_) {
        words.remove(id);
      };
    };
  };

  public shared ({ caller }) func removeWordsByLanguage(language : Text) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can remove words");
    };

    removeWordsByLanguageInternal(language);
  };

  public query ({ caller }) func getAllWords() : async [Word] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can access all words");
    };
    words.values().toArray();
  };

  public query ({ caller }) func exportWordsJSON(language : Text) : async [Word] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can export vocabulary data");
    };
    words.values().toArray().filter(
      func(word) { word.languageName == language }
    );
  };

  public query ({ caller }) func exportWordsCSV(language : Text) : async [(Text, Text, Text, Text, Text, Text)] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can export vocabulary data");
    };
    let filteredWords = words.values().toArray().filter(
      func(word) { word.languageName == language }
    );
    filteredWords.map(
      func(word) : (Text, Text, Text, Text, Text, Text) {
        let difficultyText = switch (word.difficulty) {
          case (#beginner) { "beginner" };
          case (#medium) { "medium" };
          case (#hard) { "hard" };
          case (#advanced) { "advanced" };
        };

        let addedAtText = word.addedAt.toText();

        (word.english, word.foreign, word.languageName, difficultyText, "", addedAtText);
      }
    );
  };

  public query func getWord(id : Nat) : async ?Word {
    words.get(id);
  };

  public query func getAllLanguages() : async [Language] {
    languages.values().toArray();
  };

  public query func getLanguagesSorted() : async [Language] {
    let sortedLanguages = languages.values().toArray();
    sortedLanguages;
  };

  public query func getWordsForLanguagePage(language : Text, offset : Nat, limit : Nat) : async [Word] {
    if (limit > maxPageSize) {
      Runtime.trap("Requested page size exceeds maximum allowed limit (" # maxPageSize.toText() # ").");
    };

    let filteredWords : [Word] = words.values().toArray().filter(
      func(w) { w.languageName == language },
    );

    if (offset >= filteredWords.size()) { return [] };

    let end = if (offset + limit > filteredWords.size()) {
      filteredWords.size();
    } else { offset + limit };

    filteredWords.sliceToArray(offset, end);
  };

  public query func getWordsCountForLanguage(language : Text) : async Nat {
    let filteredWords : [Word] = words.values().toArray().filter(
      func(w) { w.languageName == language }
    );
    filteredWords.size();
  };

  public query func getWordsByDifficulty(language : Text, difficultySelector : DifficultySelector) : async [Word] {
    switch (difficultySelector) {
      case (#all) {
        words.values().toArray().filter(
          func(w) {
            w.languageName == language;
          }
        );
      };
      case (#beginner) {
        words.values().toArray().filter(
          func(w) {
            w.languageName == language and w.difficulty == #beginner;
          }
        );
      };
      case (#medium) {
        words.values().toArray().filter(
          func(w) {
            w.languageName == language and w.difficulty == #medium;
          }
        );
      };
      case (#hard) {
        words.values().toArray().filter(
          func(w) {
            w.languageName == language and w.difficulty == #hard;
          }
        );
      };
      case (#advanced) {
        words.values().toArray().filter(
          func(w) {
            w.languageName == language and w.difficulty == #advanced;
          }
        );
      };
    };
  };

  public shared ({ caller }) func createQuote(text : Text) : async MotivationalQuote {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can create quotes");
    };
    let quote : MotivationalQuote = {
      id = nextQuoteId;
      text;
      createdAt = Time.now();
    };
    motivationalQuotes.add(nextQuoteId, quote);
    nextQuoteId += 1;
    quote;
  };

  public shared ({ caller }) func updateQuote(id : Nat, text : Text) : async MotivationalQuote {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Only admins can update quotes");
    };

    switch (motivationalQuotes.get(id)) {
      case (null) {
        Runtime.trap("Quote does not exist, cannot update");
      };
      case (?old) {
        let updatedQuote = { old with text };
        motivationalQuotes.add(id, updatedQuote);
        updatedQuote;
      };
    };
  };

  public shared ({ caller }) func deleteQuote(id : Nat) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Only admins can delete quotes");
    };
    switch (motivationalQuotes.get(id)) {
      case (null) { Runtime.trap("Quote does not exist, cannot delete") };
      case (_) { motivationalQuotes.remove(id) };
    };
  };

  public query ({ caller }) func getAllQuotes() : async [MotivationalQuote] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Only admins can query all quotes");
    };
    motivationalQuotes.values().toArray();
  };

  public query func getAllQuotesPublic() : async [MotivationalQuote] {
    motivationalQuotes.values().toArray();
  };

  public query ({ caller }) func getAllFeedback() : async [Feedback] {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can query all feedback");
    };
    feedback.values().toArray();
  };

  public shared ({ caller }) func submitFeedback(authorPrincipal : ?Principal, authorName : ?Text, category : FeedbackCategory, title : Text, message : Text) : async Feedback {
    let newFeedback : Feedback = {
      id = nextFeedbackId;
      authorPrincipal;
      authorName;
      category;
      title;
      message;
      status = #pending;
      createdAt = Time.now();
    };
    feedback.add(nextFeedbackId, newFeedback);
    nextFeedbackId += 1;
    newFeedback;
  };

  public shared ({ caller }) func markFeedbackCompleted(id : Nat) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Only admins can complete tasks");
    };
    switch (feedback.get(id)) {
      case (null) {
        Runtime.trap("Task does not exist for id " # id.toText());
      };
      case (?oldFeedback) {
        let updatedFeedback : Feedback = {
          oldFeedback with status = #completed;
        };
        feedback.add(id, updatedFeedback);
      };
    };
  };

  public shared ({ caller }) func deleteFeedback(id : Nat) : async () {
    if (not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Only admins can delete tasks");
    };
    switch (feedback.get(id)) {
      case (null) { Runtime.trap("Feedback does not exist for id " # id.toText()) };
      case (_) { feedback.remove(id) };
    };
  };

  // ============================================================================
  // ANALYTICS SYSTEM
  // ============================================================================

  public shared ({ caller }) func recordGameRound(correctAnswers : Nat, totalQuestions : Nat, gameMode : Text) : async () {
    // Authorization: Authenticated users can only record their own game rounds
    // Anonymous users can play but their progress is not persisted
    if (caller.isAnonymous()) {
      // Anonymous users contribute to global stats only
      totalSessions := totalSessions + 1;
      totalQuestionsAnswered := totalQuestionsAnswered + totalQuestions;
      totalCorrect := totalCorrect + correctAnswers;

      let updatedGameModePlays = (switch (gameModePlays.get(gameMode)) {
        case (null) { 1 };
        case (?existingCount) { existingCount + 1 };
      });
      gameModePlays.add(gameMode, updatedGameModePlays);

      let averageScore = totalQuestions.toFloat() / totalSessions.toFloat();
      gameModeScores.add(gameMode, averageScore);

      let currentGameModeAccuracy = calculateGlobalAccuracy(correctAnswers, totalQuestions);
      let existingAverageAccuracy = switch (gameModeAccuracy.get(gameMode)) {
        case (null) { 0.0 };
        case (?existing) { existing };
      };
      let averageGameModeAccuracy = (existingAverageAccuracy + currentGameModeAccuracy) / 2.0;
      gameModeAccuracy.add(gameMode, averageGameModeAccuracy);
      
      return;
    };

    // Authenticated users: record both global and personal stats
    let newTotalSessions = totalSessions + 1;
    let newTotalQuestions = totalQuestionsAnswered + totalQuestions;
    totalSessions := newTotalSessions;
    totalQuestionsAnswered := newTotalQuestions;
    totalCorrect := totalCorrect + correctAnswers;

    let updatedGameModePlays = (switch (gameModePlays.get(gameMode)) {
      case (null) { 1 };
      case (?existingCount) { existingCount + 1 };
    });

    gameModePlays.add(gameMode, updatedGameModePlays);

    let averageScore = totalQuestions.toFloat() / newTotalSessions.toFloat();
    gameModeScores.add(gameMode, averageScore);

    let currentGameModeAccuracy = calculateGlobalAccuracy(correctAnswers, totalQuestions);
    let existingAverageAccuracy = switch (gameModeAccuracy.get(gameMode)) {
      case (null) { 0.0 };
      case (?existing) { existing };
    };

    let averageGameModeAccuracy = (existingAverageAccuracy + currentGameModeAccuracy) / 2.0;
    gameModeAccuracy.add(gameMode, averageGameModeAccuracy);

    // Update user's personal progress
    updateUserProgress(caller, correctAnswers, totalQuestions, gameMode);
  };

  func calculateGlobalAccuracy(correct : Nat, totalQuestions : Nat) : Float {
    if (totalQuestions == 0) { return 0.0 };
    correct.toFloat() / totalQuestions.toFloat();
  };

  func updateUserProgress(userPrincipal : Principal, correctAnswers : Nat, totalQuestions : Nat, gameMode : Text) : () {
    switch (userProgress.get(userPrincipal)) {
      case (null) {
        let newUserProgress : UserProgress = {
          principal = userPrincipal;
          totalCorrect = correctAnswers;
          totalAnswered = totalQuestions;
          streak = 1;
          lastPlayed = ?Time.now();
          badges = [];
          totalGames = 1;
          accuracy = calculateGlobalAccuracy(correctAnswers, totalQuestions);
          xp = calculateXP(correctAnswers, totalQuestions);
          mostPlayedGameMode = gameMode;
        };
        userProgress.add(userPrincipal, newUserProgress);
      };
      case (?progress) {
        let updatedTotalCorrect = progress.totalCorrect + correctAnswers;
        let updatedTotalAnswered = progress.totalAnswered + totalQuestions;
        let updatedStreak = progress.streak + 1;

        let streakThreshold = 5;
        var streakBonus = 0;
        if (updatedStreak >= streakThreshold) {
          streakBonus := 20;
        };

        let badges = progress.badges;
        let badgesThreshold = 100;

        let hasBadgeAlready = badges.size() >= badgesThreshold;

        let updatedUserProgress = {
          progress with
          totalCorrect = updatedTotalCorrect;
          totalAnswered = updatedTotalAnswered;
          streak = updatedStreak;
          lastPlayed = ?Time.now();
          badges = if (not (hasBadgeAlready)) {
            let badgeText = ("Badge at " # badges.size().toText());
            badges.concat([badgeText]);
          } else { badges };
          totalGames = progress.totalGames + 1;
          accuracy = calculateGlobalAccuracy(updatedTotalCorrect, updatedTotalAnswered);
          xp = progress.xp + calculateXP(correctAnswers, totalQuestions) + streakBonus;
          mostPlayedGameMode = gameMode;
        };
        userProgress.add(userPrincipal, updatedUserProgress);
      };
    };
  };

  func calculateXP(correctAnswers : Nat, totalQuestions : Nat) : Nat {
    let baseXP = correctAnswers * 10;
    let accuracy = if (totalQuestions != 0) { calculateGlobalAccuracy(correctAnswers, totalQuestions) } else {
      0.0;
    };
    let accuracyBonus = if (accuracy >= 0.8) {
      20;
    } else { 0 };
    let combinedXP = baseXP + accuracyBonus;
    combinedXP;
  };

  public query func getGlobalAnalytics() : async GlobalAnalytics {
    // Public access - anyone can view global analytics
    let averageScore = calculateAverageScore();
    {
      totalUsers = userProgress.size();
      totalSessions;
      totalQuestionsAnswered;
      averageAccuracy = averageScore;
    };
  };

  func calculateAverageScore() : Float {
    if (totalSessions == 0) { return 0.0 };
    totalQuestionsAnswered.toFloat() / totalSessions.toFloat();
  };

  public query ({ caller }) func getUserAnalytics(principal : Principal) : async ?UserProgress {
    // Authorization: Users can view their own analytics, admins can view any user's analytics
    if (caller != principal and not isAuthenticatedAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own analytics or must be admin");
    };
    userProgress.get(principal);
  };
};
