import { db } from './prisma';

export async function getDemoUser() {
  return db.user.upsert({
    where: { email: 'demo@padhai.app' },
    update: {},
    create: { name: 'Anup', email: 'demo@padhai.app', exam: 'CEE' }
  });
}
