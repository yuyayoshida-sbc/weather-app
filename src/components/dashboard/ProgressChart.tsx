"use client";

import { CourseProgress } from "@/types/dashboard";

interface ProgressChartProps {
  courses: CourseProgress[];
}

export default function ProgressChart({ courses }: ProgressChartProps) {
  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">コース進捗</h2>
        <p className="text-gray-500 text-center py-4">
          契約中のコースはありません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">コース進捗</h2>
      <div className="space-y-6">
        {courses.map((course) => (
          <div key={course.courseId} className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">
                  {course.courseName}
                </h3>
                <p className="text-xs text-gray-500">
                  {course.usedSessions}/{course.totalSessions}回 消化済み
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">
                  {course.progressPercentage}%
                </span>
              </div>
            </div>

            {/* プログレスバー */}
            <div className="relative">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    course.progressPercentage === 100
                      ? "bg-green-500"
                      : course.isExpiringSoon
                      ? "bg-orange-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${course.progressPercentage}%` }}
                />
              </div>
              {/* 残り回数マーカー */}
              <div className="flex justify-between mt-1">
                {Array.from({ length: course.totalSessions }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < course.usedSessions
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 残り回数と有効期限 */}
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                残り <span className="font-bold text-blue-600">{course.remainingSessions}回</span>
              </span>
              <span
                className={`${
                  course.isExpiringSoon ? "text-orange-600 font-medium" : "text-gray-500"
                }`}
              >
                {course.isExpiringSoon && "⚠️ "}
                有効期限: {course.expiryDate}
                {course.daysUntilExpiry > 0 && ` (あと${course.daysUntilExpiry}日)`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
