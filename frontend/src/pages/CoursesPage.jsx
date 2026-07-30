import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CourseCard from '../components/CourseCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { mockCourses, mockCategories } from '../data/mockData';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const CoursesPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const filteredCourses = useMemo(() => {
    let filtered = [...mockCourses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    // Sort
    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.students - a.students);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      filtered.reverse();
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('all');
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('courses.title')}</h1>
          <p className="text-gray-600">{t('courses.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  {t('courses.filters')}
                </h3>
                {(selectedCategory || selectedLevel !== 'all' || searchQuery) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {t('courses.clear')}
                  </Button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('courses.search')}</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t('courses.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('courses.category')}</label>
                <div className="space-y-2">
                  <Badge
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    className={`cursor-pointer w-full justify-start mb-2 ${selectedCategory === '' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}`}
                    onClick={() => setSelectedCategory('')}
                  >
                    {t('courses.allCategories')}
                  </Badge>
                  {mockCategories.slice(0, 6).map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.name ? 'default' : 'outline'}
                      className={`cursor-pointer w-full justify-start mb-2 ${selectedCategory === category.name ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('courses.level')}</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('courses.allLevels')}</SelectItem>
                    <SelectItem value="Beginner">{t('courses.beginner')}</SelectItem>
                    <SelectItem value="Intermediate">{t('courses.intermediate')}</SelectItem>
                    <SelectItem value="Advanced">{t('courses.advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{filteredCourses.length}</span> {t('courses.coursesFound')}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{t('courses.mostPopular')}</SelectItem>
                  <SelectItem value="rating">{t('courses.highestRated')}</SelectItem>
                  <SelectItem value="newest">{t('courses.newest')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Cards */}
            {filteredCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('courses.noCoursesTitle')}</h3>
                <p className="text-gray-600 mb-4">{t('courses.noCoursesDescription')}</p>
                <Button onClick={clearFilters}>{t('courses.clear')} {t('courses.filters')}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;