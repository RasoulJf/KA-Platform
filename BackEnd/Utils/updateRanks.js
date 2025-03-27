import User from "../Models/UserMd.js";

async function updateStudentRankings() {
  const students = await User.find({ role: "student" }).sort({ score: -1 });

  const bulkUpdates = [];

  students.forEach((student, index) => {
    bulkUpdates.push({
      updateOne: {
        filter: { _id: student._id },
        update: { rankInSchool: index + 1 },
      },
    });
  });

  const grades = [...new Set(students.map((student) => student.grade))];
  for (const grade of grades) {
    const studentsInGrade = students
      .filter((student) => student.grade === grade) 
      .sort((a, b) => b.score - a.score);
    studentsInGrade.forEach((student, index) => {
      bulkUpdates.push({
        updateOne: {
          filter: { _id: student._id },
          update: { rankInGrade: index + 1 },
        },
      });
    });
  }

  const classes = [...new Set(students.map((student) => student.class))];
  for (const classId of classes) {
    const studentsInClass = students
      .filter((student) => student.class === classId)
      .sort((a, b) => b.score - a.score);
    studentsInClass.forEach((student, index) => {
      bulkUpdates.push({
        updateOne: {
          filter: { _id: student._id },
          update: { rankInClass: index + 1 },
        },
      });
    });
  }

  if (bulkUpdates.length > 0) {
    await User.bulkWrite(bulkUpdates);
  }
}

export default updateStudentRankings;
