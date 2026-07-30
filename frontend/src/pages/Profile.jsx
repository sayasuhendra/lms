import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from '../hooks/use-toast';
import { User, Mail, Briefcase, Award } from 'lucide-react';
import { mockCertificates } from '../data/mockData';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    expertise: user?.expertise || ''
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const certificates = mockCertificates.filter(cert => cert.userId === user.id);

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast({
      title: t('profile.profileUpdated'),
      description: t('profile.profileUpdatedDescription'),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('profile.title')}</h1>
          <p className="text-gray-600">{t('profile.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="space-y-8">
          <TabsList>
            <TabsTrigger value="general">
              <User className="h-4 w-4 mr-2" />
              {t('profile.general')}
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="h-4 w-4 mr-2" />
              {t('profile.myCertificates')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.profileInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-blue-600 capitalize mt-1">{user.role}</p>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('profile.fullName')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        value={user.email}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">{t('profile.bio')}</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder={t('profile.bioPlaceholder')}
                      rows={4}
                      disabled={!isEditing}
                    />
                  </div>

                  {user.role === 'instructor' && (
                    <div className="space-y-2">
                      <Label htmlFor="expertise">{t('profile.expertise')}</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="expertise"
                          value={formData.expertise}
                          onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                          placeholder={t('profile.expertisePlaceholder')}
                          className="pl-10"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            bio: user.bio || '',
                            expertise: user.expertise || ''
                          });
                        }}>
                          {t('profile.cancel')}
                        </Button>
                        <Button onClick={handleSave}>{t('profile.saveChanges')}</Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>{t('profile.editProfile')}</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.myCertificates')}</CardTitle>
              </CardHeader>
              <CardContent>
                {certificates.length > 0 ? (
                  <div className="space-y-4">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Award className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{cert.courseName}</h4>
                            <p className="text-sm text-gray-600">{t('courseDetail.instructor')}: {cert.instructorName}</p>
                            <p className="text-sm text-gray-500">
                              {t('profile.completedOn')}: {new Date(cert.completionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">{t('profile.viewCertificate')}</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('profile.noCertificatesTitle')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('profile.noCertificatesDescription')}
                    </p>
                    <Button onClick={() => navigate('/courses')}>{t('courseDetail.browseCourses')}</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;