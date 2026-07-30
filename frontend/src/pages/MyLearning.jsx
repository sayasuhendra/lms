import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import CourseCard from '../components/CourseCard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getUserEnrollments, mockCertificates } from '../data/mockData';
import { BookOpen, Award, Clock } from 'lucide-react';

const MyLearning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    navigate('/login');
    return null;
  }

  const enrollments = getUserEnrollments(user.id);
  const certificates = mockCertificates.filter(cert => cert.userId === user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('myLearning.title')}</h1>
          <p className="text-gray-600">{t('myLearning.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="courses" className="space-y-8">
          <TabsList>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              {t('myLearning.myCourses')}
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="h-4 w-4 mr-2" />
              {t('myLearning.certificates')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {enrollments.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((enrollment) => (
                    <CourseCard
                      key={enrollment.id}
                      course={enrollment.course}
                      showProgress={true}
                      progress={enrollment.progress}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('myLearning.noCoursesTitle')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('myLearning.noCoursesDescription')}
                  </p>
                  <Button onClick={() => navigate('/courses')}>{t('courseDetail.browseCourses')}</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="certificates">
            {certificates.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 mx-auto">
                        <Award className="h-8 w-8 text-yellow-600" />
                      </div>
                      <h3 className="font-bold text-center mb-2">{cert.courseName}</h3>
                      <p className="text-sm text-gray-600 text-center mb-1">
                        {t('courseDetail.instructor')}: {cert.instructorName}
                      </p>
                      <p className="text-sm text-gray-500 text-center mb-4">
                        {t('myLearning.completedOn')}: {new Date(cert.completionDate).toLocaleDateString()}
                      </p>
                      <Button variant="outline" className="w-full">
                        {t('myLearning.viewCertificate')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Award className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('myLearning.noCertificatesTitle')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('myLearning.noCertificatesDescription')}
                  </p>
                  <Button onClick={() => navigate('/courses')}>{t('courseDetail.browseCourses')}</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyLearning;
