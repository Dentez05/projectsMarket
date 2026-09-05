export interface Project {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  technologies: string[];
  demo?: string;
  createdAt: string;
  popular: boolean;
  isNew: boolean;
}

export const CATEGORIES = ['Все', 'E-commerce', 'Dashboard', 'CRM', 'Мобильное', 'API', 'Чат-бот', 'Аналитика'];

export const projects: Project[] = [
  {
    id: 1,
    title: 'E-commerce платформа',
    description: 'Полнофункциональный интернет-магазин с корзиной, оплатой и управлением товарами.',
    fullDescription: 'Готовое решение для интернет-торговли с полным циклом покупки. Включает каталог товаров с фильтрацией, корзину, оформление заказа, интеграцию с платёжными системами (Stripe, PayPal), личный кабинет покупателя и панель администратора. Поддерживает неограниченное количество товаров, категорий и атрибутов.',
    price: 12900,
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format',
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redux', 'Docker'],
    demo: 'https://demo.example.com',
    createdAt: '2024-11-15',
    popular: true,
    isNew: false,
  },
  {
    id: 2,
    title: 'CRM-система для бизнеса',
    description: 'Управление клиентами, сделками и воронкой продаж в одном месте.',
    fullDescription: 'Профессиональная CRM-система для малого и среднего бизнеса. Включает модули управления контактами, сделками, задачами и коммуникациями. Встроенная аналитика и отчёты, интеграция с почтой и телефонией, Kanban-доска для сделок, история взаимодействий с клиентами.',
    price: 18500,
    category: 'CRM',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=500&fit=crop&auto=format',
    ],
    technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis', 'WebSocket'],
    createdAt: '2024-10-20',
    popular: true,
    isNew: false,
  },
  {
    id: 3,
    title: 'Аналитический дашборд',
    description: 'Визуализация данных и бизнес-метрик в реальном времени.',
    fullDescription: 'Мощная платформа для визуализации данных и мониторинга ключевых показателей бизнеса. Поддерживает более 20 типов графиков и диаграмм, настраиваемые виджеты, экспорт отчётов в PDF/Excel, подключение к внешним источникам данных через API, мультипользовательский доступ с правами.',
    price: 9900,
    category: 'Аналитика',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?w=800&h=500&fit=crop&auto=format',
    ],
    technologies: ['React', 'D3.js', 'Python', 'FastAPI', 'ClickHouse'],
    demo: 'https://demo.example.com',
    createdAt: '2024-12-01',
    popular: true,
    isNew: true,
  },
  {
    id: 4,
    title: 'Telegram-бот для автопродаж',
    description: 'Автоматизированный бот для приёма заказов и оплаты через Telegram.',
    fullDescription: 'Готовый Telegram-бот для автоматизации продаж цифровых и физических товаров. Поддерживает интеграцию с ЮKassa, оплату криптовалютой, управление каталогом через админ-панель, рассылки по базе подписчиков, аналитику продаж и автоматическую доставку цифрового контента.',
    price: 7500,
    category: 'Чат-бот',
    image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&h=500&fit=crop&auto=format',
    ],
    technologies: ['Python', 'aiogram', 'SQLite', 'ЮKassa API', 'Heroku'],
    createdAt: '2024-12-10',
    popular: false,
    isNew: true,
  },
  {
    id: 5,
    title: 'REST API для мобильного приложения',
    description: 'Масштабируемый бэкенд API с аутентификацией и документацией.',
    fullDescription: 'Готовый бэкенд API для мобильного приложения. Включает JWT-аутентификацию, управление пользователями, push-уведомления, работу с медиафайлами (S3), роли и права доступа, логирование, мониторинг (Sentry), автоматическую документацию Swagger, кеширование Redis и горизонтальное масштабирование.',
    price: 14200,
    category: 'API',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop&auto=format',
    ],
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Redis', 'AWS S3'],
    createdAt: '2024-11-28',
    popular: false,
    isNew: true,
  },
  {
    id: 6,
    title: 'HR Dashboard — управление персоналом',
    description: 'Учёт сотрудников, отпусков, KPI и зарплат в одной системе.',
    fullDescription: 'Комплексная система управления персоналом для HR-отделов. Модули: база сотрудников с карточками и документами, планирование отпусков, учёт рабочего времени, расчёт KPI и бонусов, онбординг новых сотрудников, электронное подписание документов, интеграция с 1С.',
    price: 21000,
    category: 'Dashboard',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&auto=format',
    ],
    technologies: ['React', 'TypeScript', 'Nest.js', 'PostgreSQL', 'Prisma'],
    demo: 'https://demo.example.com',
    createdAt: '2024-09-05',
    popular: true,
    isNew: false,
  },
  {
    id: 7,
    title: 'Мобильное приложение для доставки',
    description: 'React Native приложение для служб доставки с картой и трекингом.',
    fullDescription: 'Полнофункциональное мобильное приложение для служб доставки. Включает клиентское приложение (заказ, трекинг), приложение курьера (маршруты, статусы), админ-панель в браузере. Интеграция с картами (Google Maps/Яндекс.Карты), push-уведомления, история заказов, рейтинговая система.',
    price: 32000,
    category: 'Мобильное',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=500&fit=crop&auto=format',
    ],
    technologies: ['React Native', 'Expo', 'Node.js', 'Socket.io', 'Google Maps'],
    createdAt: '2024-08-14',
    popular: false,
    isNew: false,
  },
  {
    id: 8,
    title: 'Онлайн-школа с видеокурсами',
    description: 'Платформа для продажи и прохождения обучающих курсов.',
    fullDescription: 'Образовательная платформа для онлайн-школ и преподавателей. Включает создание и управление курсами, видеоплеер с защитой контента, система прогресса и сертификатов, форум и комментарии, интеграция с платёжными системами, аналитика учебного процесса, мобильная версия.',
    price: 27500,
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=500&fit=crop&auto=format',
    ],
    technologies: ['Next.js', 'Stripe', 'Prisma', 'S3', 'FFmpeg', 'Tailwind'],
    demo: 'https://demo.example.com',
    createdAt: '2024-10-30',
    popular: true,
    isNew: false,
  },
];
