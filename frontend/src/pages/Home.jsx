import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '../context/AppSettingsContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import CourseCard from '../components/CourseCard';
import { mockCourses, mockCategories } from '../data/mockData';
import { ArrowRight, TrendingUp, Award, Users, BookOpen } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useAppSettings();
  const featuredCourses = mockCourses.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-black leading-tight">
                {t('home.heroTitle')}
                <span className="block text-gray-700">{settings.organization_name}</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t('home.heroDescription')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate('/courses')} className="group bg-orange-600 hover:bg-orange-700 text-white hover:text-white">
                  {t('home.exploreCourses')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/register')} className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-600">
                  {t('home.registerFree')}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                  alt={`Pembelajaran ${settings.organization_name}`}
                  className="rounded-2xl shadow-2xl border border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white border border-orange-200 rounded-lg mb-3">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-black">200+</div>
              <div className="text-gray-600">{t('home.stats.modules')}</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white border border-orange-200 rounded-lg mb-3">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-black">10K+</div>
              <div className="text-gray-600">{t('home.stats.activeMembers')}</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white border border-orange-200 rounded-lg mb-3">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-black">50+</div>
              <div className="text-gray-600">{t('home.stats.experts')}</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white border border-orange-200 rounded-lg mb-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-black">95%</div>
              <div className="text-gray-600">{t('home.stats.successRate')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">{t('home.categoriesTitle')}</h2>
            <p className="text-gray-600 text-lg">{t('home.categoriesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockCategories.slice(0, 8).map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border-gray-200 bg-white"
                onClick={() => navigate(`/courses?category=${category.name}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-50 border border-orange-200 rounded-xl mb-3">
                    <BookOpen className="h-7 w-7 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-black mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} {t('home.courses')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">{t('home.featuredTitle')}</h2>
              <p className="text-gray-600">{t('home.featuredSubtitle')}</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/courses')} className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-600">
              {t('home.viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('home.ctaTitle')}
              </h2>
              <p className="text-orange-50 text-lg mb-8">
                {t('home.ctaDescription')}
              </p>
              <Button size="lg" variant="secondary" onClick={() => navigate('/register')} className="group bg-white text-orange-600 hover:bg-orange-50">
                {t('home.ctaButton')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
