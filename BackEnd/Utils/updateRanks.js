import User from "../Models/UserMd.js";

async function updateRanks() {
    const students = await User.find({ role: 'Student' }).sort({ score: -1 });

    students.forEach((student, index) => {
        student.rankInSchool = index + 1;
    });

    const grades = await User.distinct("grade");
    for (const grade of grades) {
        const studentsInGrade = await User.find({ role: 'Student', grade }).sort({ score: -1 });
        studentsInGrade.forEach((student, index) => { 
            student.rankInGrade = index + 1;
        });
        await Promise.all(studentsInGrade.map(student => student.save()));
    }

    const classes = await User.distinct("class");
    for (const classId of classes) {
        const studentsInClass = await User.find({ role: 'Student', class: classId }).sort({ score: -1 });
        studentsInClass.forEach((student, index) => {
            student.rankInClass = index + 1;
        });
        await Promise.all(studentsInClass.map(student => student.save()));
    }

    await Promise.all(students.map(student => student.save())); 
}

export default updateRanks;
