import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Progress } from '../components/ui/progress';
import { toast } from '../hooks/use-toast';
import { getCourseById, isUserEnrolled } from '../data/mockData';
import { Star, Users, Clock, Globe, PlayCircle, FileText, Award, CheckCircle, MessageSquare } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = getCourseById(id);
  const [enrolled, setEnrolled] = useState(user ? isUserEnrolled(user.id, id) : false);

  const { t } = useTranslation();

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('courseDetail.courseNotFound')}</h2>
          <Button onClick={() => navigate('/courses')}>{t('courseDetail.browseCourses')}</Button>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    if (!user) {
      toast({
        title: t('courseDetail.loginRequired'),
        description: t('courseDetail.loginRequiredDescription'),
      });
      navigate('/login');
      return;
    }

    setEnrolled(true);
    localStorage.setItem(`enrollment_${user.id}_${id}`, JSON.stringify({
      enrolledDate: new Date().toISOString(),
      progress: 0
    }));
    toast({
      title: t('courseDetail.enrolledSuccess'),
      description: t('courseDetail.enrolledSuccessDescription'),
    });
  };

  const handleStartCourse = () => {
    navigate(`/learn/${id}`);
  };

  const totalLessons = course.curriculum.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalDuration = course.curriculum.reduce((acc, module) => 
    acc + module.lessons.reduce((sum, lesson) => sum + parseInt(lesson.duration), 0), 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Badge className="bg-orange-600 hover:bg-orange-700 text-white">{course.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">{course.title}</h1>
              <p className="text-xl text-gray-700">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-500">({course.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>{course.language}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                  <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500">{t('courseDetail.instructor')}</p>
                  <p className="font-semibold text-gray-900">{course.instructor.name}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full rounded-lg mb-4"
                  />
                  <div className="space-y-4">
                    {enrolled ? (
                      <Button className="w-full" size="lg" onClick={handleStartCourse}>
                        <PlayCircle className="mr-2 h-5 w-5" />
                        {t('courseDetail.continueLearning')}
                      </Button>
                    ) : (
                      <Button className="w-full" size="lg" onClick={handleEnroll}>
                        {t('courseDetail.enrollFree')}
                      </Button>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('courseDetail.level')}</span>
                        <span className="font-semibold">{course.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('courseDetail.lessons')}</span>
                        <span className="font-semibold">{totalLessons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('courseDetail.duration')}</span>
                        <span className="font-semibold">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('courseDetail.certificate')}</span>
                        <span className="font-semibold">{t('courseDetail.yes')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">{t('courseDetail.overview')}</TabsTrigger>
            <TabsTrigger value="curriculum">{t('courseDetail.curriculum')}</TabsTrigger>
            <TabsTrigger value="instructor">{t('courseDetail.instructor')}</TabsTrigger>
            <TabsTrigger value="reviews">{t('courseDetail.reviews')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t('courseDetail.aboutCourse')}</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{course.longDescription}</p>
                
                <h3 className="text-xl font-semibold mb-3">{t('courseDetail.whatYouLearn')}</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.skills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t('courseDetail.courseCurriculum')}</h2>
                <p className="text-gray-600 mb-6">
                  {course.curriculum.length} {t('courseDetail.modules')} • {totalLessons} {t('courseDetail.lessons')} • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m {t('courseDetail.totalLength')}
                </p>
                <Accordion type="single" collapsible className="space-y-2">
                  {course.curriculum.map((module, index) => (
                    <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-semibold text-left">
                            Module {index + 1}: {module.title}
                          </span>
                          <span className="text-sm text-gray-600">
                            {module.lessons.length} {t('courseDetail.lessons')}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                {lesson.type === 'video' ? (
                                  <PlayCircle className="h-5 w-5 text-orange-600" />
                                ) : (
                                  <FileText className="h-5 w-5 text-orange-600" />
                                )}
                                <span className="text-gray-700">{lesson.title}</span>
                              </div>
                              <span className="text-sm text-gray-500">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{course.instructor.name}</h2>
                    {course.instructor.expertise && (
                      <p className="text-orange-600 font-medium mb-3">{course.instructor.expertise}</p>
                    )}
                    <p className="text-gray-700 leading-relaxed mb-4">{course.instructor.bio}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span>4.8 Instructor Rating</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>150K+ Students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PlayCircle className="h-5 w-5" />
                        <span>12 Courses</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">{t('courseDetail.reviews')}</h2>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Student${i}`} />
                          <AvatarFallback>S{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Student {i}</h4>
                            <span className="text-sm text-gray-500">2 weeks ago</span>
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            {[...Array(5)].map((_, index) => (
                              <Star key={index} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-gray-700">
                            Excellent course! The instructor explains complex concepts clearly and provides great examples.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetail;