import type { User, Enrollment, Course } from '@prisma/client';

/**
 * Vue "étudiant" agrégée depuis Prisma : un User (role=STUDENT) rattaché
 * à une inscription (Enrollment) et à la formation (Course) suivie.
 */
export class Student {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string | null;
  registrationDate: Date;
  program: string;

  constructor(params: {
    id: string;
    lastName: string;
    firstName: string;
    email: string;
    phone?: string | null;
    registrationDate: Date;
    program: string;
  }) {
    this.id = params.id;
    this.lastName = params.lastName;
    this.firstName = params.firstName;
    this.email = params.email;
    this.phone = params.phone ?? null;
    this.registrationDate = params.registrationDate;
    this.program = params.program;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /** Construit un Student à partir d'un User, de son Enrollment et de la Course suivie. */
  static fromEnrollment(
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>,
    enrollment: Pick<Enrollment, 'createdAt'>,
    course: Pick<Course, 'titleFr'>
  ): Student {
    return new Student({
      id: user.id,
      lastName: user.lastName,
      firstName: user.firstName,
      email: user.email,
      phone: user.phone,
      registrationDate: enrollment.createdAt,
      program: course.titleFr,
    });
  }
}
