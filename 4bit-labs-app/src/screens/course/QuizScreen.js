import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { getQuiz, submitQuiz } from '../../services/quizService';

const QuizScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const quizId = route?.params?.quizId;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const timerRef = useRef(null);

  // Fetch quiz from API
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (!quizId) {
          console.warn('No quizId provided');
          setLoading(false);
          return;
        }
        const data = await getQuiz(quizId);
        setQuiz(data);
        setQuestions(data.questions || []);
        setTimeLeft((data.duration || 15) * 60);
      } catch (err) {
        console.error('Failed to load quiz:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (loading || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, questions]);

  const question = questions[currentQ];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (currentQ + 1) / totalQuestions : 0;

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  const handleSelectAnswer = (key) => {
    setSelectedAnswer(key);
    setAnswers(prev => ({ ...prev, [currentQ]: key }));
  };

  const handleNext = () => {
    if (currentQ < totalQuestions - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(answers[currentQ + 1] || null);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    
    const timeTakenSeconds = (quiz?.duration || 15) * 60 - timeLeft;

    // Format answers for API: [{ questionId, selectedAnswer }]
    const formattedAnswers = Object.entries(answers).map(([qIdx, ans]) => ({
      questionId: questions[parseInt(qIdx)]?._id || parseInt(qIdx),
      selectedAnswer: ans,
    }));

    try {
      const attempt = await submitQuiz(quizId, formattedAnswers, timeTakenSeconds);
      navigation.replace('Result', {
        quizId,
        score: attempt.score,
        total: attempt.totalMarks || quiz?.totalMarks,
        percentage: attempt.percentage,
        passed: attempt.passed,
        pointsEarned: attempt.pointsEarned,
        timeSpent: timeTakenSeconds,
      });
    } catch (err) {
      console.error('Quiz submit failed:', err.message);
      // Fallback: do local grading
      let correct = 0;
      Object.entries(answers).forEach(([qIdx, ans]) => {
        if (questions[parseInt(qIdx)]?.correctAnswer === ans) correct++;
      });
      navigation.replace('Result', {
        quizId,
        score: correct,
        total: totalQuestions,
        answers,
        timeSpent: timeTakenSeconds,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.onSurfaceVariant, marginTop: 12 }}>Loading quiz...</Text>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.onSurfaceVariant, fontSize: 16 }}>No quiz data available.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Quiz Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{quiz?.title || 'Quiz'}</Text>
        </View>
        <View style={styles.timerBadge}>
          <Text style={styles.timerIcon}>⏱</Text>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question Counter */}
        <Text style={styles.questionCounter}>QUESTION {currentQ + 1} OF {totalQuestions}</Text>

        {/* Question Text */}
        <Text style={styles.questionText}>{question.question}</Text>

        {/* Question Image */}
        {question.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: question.image }} style={styles.questionImage} />
          </View>
        )}

        {/* Options / Written Answer */}
        {question.type === 'written' ? (
          <View style={styles.writtenContainer}>
             <TextInput
               style={styles.writtenInput}
               placeholder="Write your answer here..."
               placeholderTextColor={COLORS.onSurfaceVariant}
               multiline
               textAlignVertical="top"
               value={selectedAnswer || ''}
               onChangeText={handleSelectAnswer}
             />
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => handleSelectAnswer(option.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionKeyCircle, isSelected && styles.optionKeyCircleSelected]}>
                    <Text style={[styles.optionKeyText, isSelected && styles.optionKeyTextSelected]}>
                      {option.key}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.text}
                  </Text>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.9} disabled={submitting}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButton}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentQ === totalQuestions - 1 ? 'Submit' : 'Next'}
                </Text>
                <Text style={styles.nextButtonArrow}>→</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Decorative blobs */}
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.9)', ...SHADOWS.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  closeIcon: { fontSize: 18, color: COLORS.onSurfaceVariant },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.onSurfaceVariant, letterSpacing: -0.3 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surfaceContainerLow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  timerIcon: { fontSize: 14, color: COLORS.primary },
  timerText: { fontSize: 16, fontWeight: '700', color: COLORS.primary, fontVariant: ['tabular-nums'] },
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingBottom: 120 },
  questionCounter: { fontSize: 12, fontWeight: '600', color: COLORS.tertiary, letterSpacing: 2, textAlign: 'center', marginBottom: SPACING.lg },
  questionText: { fontSize: 26, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -1, lineHeight: 34, textAlign: 'center', marginBottom: SPACING['2xl'] },
  imageContainer: { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING['2xl'], backgroundColor: COLORS.surfaceContainerLow },
  questionImage: { width: '100%', height: 180, resizeMode: 'cover' },
  optionsContainer: { gap: 14 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: RADIUS.xl, backgroundColor: COLORS.surfaceContainerLowest, borderWidth: 2, borderColor: 'transparent', ...SHADOWS.sm },
  optionCardSelected: { borderColor: COLORS.primary },
  optionKeyCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  optionKeyCircleSelected: { backgroundColor: COLORS.primary },
  optionKeyText: { fontSize: 16, fontWeight: '700', color: COLORS.onSurfaceVariant },
  optionKeyTextSelected: { color: COLORS.white },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.onSurface, lineHeight: 22 },
  optionTextSelected: { fontWeight: '600' },
  checkMark: { fontSize: 18, color: COLORS.primary, fontWeight: '700' },
  footer: { paddingHorizontal: SPACING.xl, paddingTop: 14, backgroundColor: 'rgba(255,255,255,0.9)' },
  progressBar: { height: 6, backgroundColor: COLORS.surfaceContainerHighest, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', backgroundColor: COLORS.tertiary, borderRadius: RADIUS.full },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 40, borderRadius: RADIUS.full, alignSelf: 'flex-end', gap: 8, ...SHADOWS.primaryGlow },
  nextButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  nextButtonArrow: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  decorTop: { position: 'absolute', top: 80, right: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(186,0,19,0.03)', zIndex: -1 },
  decorBottom: { position: 'absolute', bottom: 80, left: -40, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(0,97,144,0.03)', zIndex: -1 },
  writtenContainer: { flex: 1, minHeight: 200, marginTop: SPACING.md },
  writtenInput: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.lg, padding: SPACING.lg, fontSize: 16, color: COLORS.onSurface, borderWidth: 2, borderColor: COLORS.surfaceContainerHigh, textAlignVertical: 'top' },
});

export default QuizScreen;
