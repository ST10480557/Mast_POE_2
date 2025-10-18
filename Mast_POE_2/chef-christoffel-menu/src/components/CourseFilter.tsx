import React from 'react';

interface CourseFilterProps {
  selectedCourse: string;
  onCourseChange: (course: string) => void;
}

const CourseFilter: React.FC<CourseFilterProps> = ({ selectedCourse, onCourseChange }) => {
  const courses = ['All', 'Starters', 'Mains', 'Desserts'];

  return (
    <div>
      <label htmlFor="course-select">Filter by Course:</label>
      <select
        id="course-select"
        value={selectedCourse}
        onChange={(e) => onCourseChange(e.target.value)}
      >
        {courses.map((course) => (
          <option key={course} value={course}>
            {course}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CourseFilter;