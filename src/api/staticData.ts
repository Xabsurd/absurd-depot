import type { Dashboard } from '@/types/staticData';
import request from './request';

export function getDashboardData() {
  return request<Dashboard>({
    url: './assets/data/dashboard.json',
    method: 'get'
  });
}
