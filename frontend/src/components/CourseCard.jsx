import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star, Users, Clock } from 'lucide-react';

const CourseCard = ({ course, showProgress = false, progress = 0 }) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group border-gray-200"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-white text-gray-900 hover:bg-white">
          {course.level}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {course.category}
          </Badge>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
            <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{course.instructor.name}</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">{course.rating}</span>
            <span>({course.reviews.toLocaleString()})</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{course.students.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
      {showProgress && (
        <CardFooter className="px-4 pb-4">
          <div className="w-full">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-orange-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default CourseCard;