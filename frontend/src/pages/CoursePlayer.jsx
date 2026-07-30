import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { toast } from '../hooks/use-toast';
import { getCourseById, mockQuizzes, mockDiscussions } from '../data/mockData';
import { PlayCircle, CheckCircle, FileText, ChevronLeft, MessageSquare, Send } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const CoursePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = getCourseById(id);
  
  const [currentLesson, setCurrentLesson] = useState(
    course?.curriculum[0]?.lessons[0] || null
  );
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [discussionText, setDiscussionText] = useState('');

  if (!course || !user) {
    return null;
  }

  const handleLessonComplete = () => {
    if (!completedLessons.includes(currentLesson.id)) {
      setCompletedLessons([...completedLessons, currentLesson.id]);
      toast({
        title: 'Lesson completed!',
        description: 'Great progress! Keep learning.',
      });
    }
  };

  const handleQuizSubmit = () => {
    const quiz = mockQuizzes.find(q => q.lessonId === currentLesson.id);
    if (quiz) {
      let correctCount = 0;
      quiz.questions.forEach((q) => {
        if (quizAnswers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      });
      const score = Math.round((correctCount / quiz.questions.length) * 100);
      setQuizSubmitted(true);
      toast({
        title: `Quiz Score: ${score}%`,
        description: score >= 70 ? 'Well done!' : 'Keep practicing!',
      });
    }
  };

  const totalLessons = course.curriculum.reduce((acc, module) => acc + module.lessons.length, 0);
  const progressPercentage = Math.round((completedLessons.length / totalLessons) * 100);

  const currentQuiz = mockQuizzes.find(q => q.lessonId === currentLesson?.id);
  const discussions = mockDiscussions.filter(d => d.courseId === id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(`/courses/${id}`)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {completedLessons.length} of {totalLessons} lessons completed
              </div>
              <div className="w-32">
                <Progress value={progressPercentage} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                  {currentLesson?.type === 'video' ? (
                    <div className="text-center text-white">
                      <PlayCircle className="h-20 w-20 mx-auto mb-4" />
                      <p className="text-lg">Video Player Placeholder</p>
                      <p className="text-sm text-gray-400 mt-2">{currentLesson.title}</p>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <FileText className="h-20 w-20 mx-auto mb-4" />
                      <p className="text-lg">Quiz Interface</p>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-4">{currentLesson?.title}</h2>

                {currentLesson?.type === 'quiz' && currentQuiz ? (
                  <div className="space-y-6">
                    {currentQuiz.questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <p className="font-semibold mb-3">
                          {index + 1}. {question.question}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                quizSubmitted
                                  ? optIndex === question.correctAnswer
                                    ? 'bg-green-50 border-green-500'
                                    : quizAnswers[question.id] === optIndex
                                    ? 'bg-red-50 border-red-500'
                                    : 'bg-gray-50'
                                  : quizAnswers[question.id] === optIndex
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => {
                                if (!quizSubmitted) {
                                  setQuizAnswers({ ...quizAnswers, [question.id]: optIndex });
                                }
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                        {quizSubmitted && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                    {!quizSubmitted ? (
                      <Button onClick={handleQuizSubmit} className="w-full">
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                      }} variant="outline" className="w-full">
                        Retry Quiz
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <p className="text-gray-700">
                      This is where the video lesson content would be displayed. In a real implementation,
                      this would include a video player with the actual course content.
                    </p>
                    <Button onClick={handleLessonComplete} className="mt-4">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs for Overview and Discussions */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="discussions">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Discussions
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">About this lesson</h3>
                      <p className="text-gray-700">
                        Learn the key concepts and practical applications covered in this lesson.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="discussions" className="space-y-4">
                    <div className="space-y-4">
                      {discussions.map((discussion) => (
                        <div key={discussion.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <Avatar>
                              <AvatarImage src={discussion.userAvatar} />
                              <AvatarFallback>{discussion.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm">{discussion.userName}</h4>
                                <span className="text-xs text-gray-500">{discussion.category}</span>
                              </div>
                              <h5 className="font-medium mb-1">{discussion.title}</h5>
                              <p className="text-sm text-gray-600 mb-2">{discussion.content}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{discussion.replies} replies</span>
                                <span>{discussion.likes} likes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Start a discussion</h4>
                      <Textarea
                        placeholder="Ask a question or share your thoughts..."
                        value={discussionText}
                        onChange={(e) => setDiscussionText(e.target.value)}
                        className="mb-2"
                      />
                      <Button onClick={() => {
                        if (discussionText.trim()) {
                          toast({ title: 'Discussion posted!', description: 'Your question has been shared with the class.' });
                          setDiscussionText('');
                        }
                      }}>
                        <Send className="h-4 w-4 mr-2" />
                        Post Discussion
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Curriculum Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Course Content</h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {course.curriculum.map((module, moduleIndex) => (
                    <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-3">
                      <AccordionTrigger className="hover:no-underline text-sm">
                        <span className="text-left font-semibold">
                          {moduleIndex + 1}. {module.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pt-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                currentLesson?.id === lesson.id
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => {
                                setCurrentLesson(lesson);
                                setShowQuiz(lesson.type === 'quiz');
                                setQuizSubmitted(false);
                                setQuizAnswers({});
                              }}
                            >
                              <div className="flex items-center space-x-2 flex-1">
                                {lesson.type === 'video' ? (
                                  <PlayCircle className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                  <FileText className="h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="text-sm">{lesson.title}</span>
                              </div>
                              {completedLessons.includes(lesson.id) && (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;