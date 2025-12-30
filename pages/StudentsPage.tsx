
import React, { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Icon } from '../components/ui/Icon';
import { INITIAL_NAV_ITEMS, INITIAL_STUDENTS_LIST } from '../utils/constants';
import { StudentPageData } from '../types';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { StudentFormModal } from '../components/StudentFormModal';

const StudentsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<StudentPageData[]>(INITIAL_STUDENTS_LIST);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        const lowerTerm = searchTerm.toLowerCase();
        return students.filter(student => 
            student.firstName.toLowerCase().includes(lowerTerm) || 
            student.lastName.toLowerCase().includes(lowerTerm) ||
            student.school.toLowerCase().includes(lowerTerm) ||
            student.financialGuardian.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm, students]);

    const selectedStudent = useMemo(() => {
        return students.find(s => s.id === selectedStudentId) || null;
    }, [selectedStudentId, students]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            const [y, m, d] = dateStr.split('-');
            const date = new Date(Number(y), Number(m) - 1, Number(d));
            return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const handleUpdateStudent = (updatedStudent: StudentPageData) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    };

    const handleDeleteStudent = (studentId: string) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setSelectedStudentId(null);
    };

    const handleSaveNewStudent = (newStudent: StudentPageData) => {
        setStudents(prev => [newStudent, ...prev]);
        setIsAddStudentModalOpen(false);
    };

    return (
        <div className="flex h-screen w-full font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
            <Sidebar navItems={INITIAL_NAV_ITEMS} />
            
            <main className="flex flex-col flex-1 w-full overflow-hidden relative">
                <header className="flex flex-col px-6 py-5 border-b border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <h1 className="text-primary dark:text-primary text-2xl font-black tracking-tight min-w-72">
                            Alunos
                        </h1>
                        <div className="flex items-center gap-4 ml-auto">
                            <Button primary={true} icon="add" onClick={() => setIsAddStudentModalOpen(true)}>Novo Aluno</Button>
                            <div className="w-px h-8 bg-neutral-200 dark:bg-gray-800 hidden sm:block"></div>
                            <button className="relative group">
                                <Avatar 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqBvK4GjvciB8lHHxTrHVRW-v9GaQJaJX7vaTZEhMqiIrXlqNSkqiGKnQV_d6pxlrXAkzuyHvD4Kgj9abuzvPwwHDSn43M9tDRZo2MKgciw1zLCJAhKsbxbh42zIT_K5NdoRjDEB0DWjSqWEFYMM_eo-wawPmPH7sUxFgn7eFSjxQweABGRkcYVRWj8-pyjnCquVnO7ZMjuXgRz2kAAHAPMjsroiG7_L-NYAcC8iANDzU5aSosCt0yQfb1Y91Ac42Xk4nd5ujgenQ" 
                                    alt="User profile avatar" 
                                    className="ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-background-dark rounded-full"></div>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex-grow max-w-sm">
                            <label className="flex flex-col w-full group">
                                <div className="flex w-full flex-1 items-stretch rounded-lg h-10 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/50">
                                    <div className="text-gray-500 dark:text-gray-400 flex bg-neutral-200 dark:bg-gray-800/50 items-center justify-center pl-3 rounded-l-lg border-r-0">
                                        <Icon name="search" />
                                    </div>
                                    <input 
                                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none border-none bg-neutral-200 dark:bg-gray-800/50 h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" 
                                        placeholder="Buscar alunos..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>
                        <Button icon="filter_list">Filtros</Button>
                    </div>
                </header>
                
                <div className="flex-1 overflow-auto bg-neutral-200/50 dark:bg-background-dark/50 p-6">
                    <div className="min-w-full inline-block align-middle">
                        <div className="border border-neutral-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-background-dark shadow-sm">
                            <table className="min-w-full divide-y divide-neutral-200 dark:divide-gray-800">
                                <thead className="bg-neutral-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data de nascimento</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Escola</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responsável Financeiro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-gray-800">
                                    {filteredStudents.map((student) => (
                                        <tr 
                                            key={student.id} 
                                            onClick={() => setSelectedStudentId(student.id)}
                                            className="hover:bg-neutral-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{student.firstName} {student.lastName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(student.dateOfBirth)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                                    <Icon name="school" className="text-[16px] text-gray-400" />
                                                    <span>{student.school}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                                    <Icon name="person" className="text-[16px] text-gray-400" />
                                                    <span>{student.financialGuardian}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                                Nenhum aluno encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <StudentDetailModal
                    isOpen={!!selectedStudentId}
                    onClose={() => setSelectedStudentId(null)}
                    student={selectedStudent}
                    onUpdate={handleUpdateStudent}
                    onDelete={handleDeleteStudent}
                />

                <StudentFormModal
                    isOpen={isAddStudentModalOpen}
                    onClose={() => setIsAddStudentModalOpen(false)}
                    onSave={handleSaveNewStudent}
                />
            </main>
        </div>
    );
};

export default StudentsPage;
