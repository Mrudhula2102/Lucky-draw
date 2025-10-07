# Component Guide

This guide provides detailed information about all reusable components in the Lucky Draw Frontend application.

## 📦 Common Components

### Button Component

**Location**: `src/components/common/Button.tsx`

A versatile button component with multiple variants and states.

**Props**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  // ... extends HTMLButtonElement props
}
```

**Usage**:
```tsx
import { Button } from '../components/common/Button';
import { Plus } from 'lucide-react';

<Button 
  variant="primary" 
  size="md" 
  icon={<Plus className="w-5 h-5" />}
  onClick={handleClick}
>
  Create New
</Button>

<Button variant="danger" loading={isDeleting}>
  Delete
</Button>
```

**Variants**:
- `primary`: Blue background (main actions)
- `secondary`: Gray background (secondary actions)
- `danger`: Red background (destructive actions)
- `success`: Green background (positive actions)
- `outline`: Transparent with border (tertiary actions)

---

### Card Component

**Location**: `src/components/common/Card.tsx`

A container component for grouping related content.

**Props**:
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hover?: boolean;
}
```

**Usage**:
```tsx
import { Card } from '../components/common/Card';

<Card 
  title="Contest Details" 
  subtitle="Manage your contest information"
  actions={<Button>Edit</Button>}
  hover
>
  <p>Card content goes here</p>
</Card>
```

---

### Input Component

**Location**: `src/components/common/Input.tsx`

Form input component with label, error, and icon support.

**Props**:
```typescript
interface InputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  // ... extends HTMLInputElement props
}
```

**Usage**:
```tsx
import { Input } from '../components/common/Input';
import { Mail } from 'lucide-react';

<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  icon={<Mail className="w-5 h-5" />}
  error={emailError}
  required
/>
```

---

### TextArea Component

**Location**: `src/components/common/Input.tsx`

Multi-line text input component.

**Props**:
```typescript
interface TextAreaProps {
  label?: string;
  error?: string;
  rows?: number;
  // ... extends HTMLTextAreaElement props
}
```

**Usage**:
```tsx
import { TextArea } from '../components/common/Input';

<TextArea
  label="Description"
  rows={4}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Enter description..."
/>
```

---

### Select Component

**Location**: `src/components/common/Input.tsx`

Dropdown select component.

**Props**:
```typescript
interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  // ... extends HTMLSelectElement props
}
```

**Usage**:
```tsx
import { Select } from '../components/common/Input';

<Select
  label="Status"
  options={[
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ACTIVE', label: 'Active' }
  ]}
  value={status}
  onChange={(e) => setStatus(e.target.value)}
/>
```

---

### Modal Component

**Location**: `src/components/common/Modal.tsx`

Animated modal dialog component.

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}
```

**Usage**:
```tsx
import { Modal } from '../components/common/Modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Create Contest"
  size="lg"
  footer={
    <>
      <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </>
  }
>
  <p>Modal content here</p>
</Modal>
```

**Features**:
- Animated entrance/exit with Framer Motion
- Backdrop click to close
- ESC key to close
- Prevents body scroll when open
- Responsive sizes

---

### Table Component

**Location**: `src/components/common/Table.tsx`

Generic table component with pagination support.

**Props**:
```typescript
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}
```

**Usage**:
```tsx
import { Table } from '../components/common/Table';

const columns = [
  {
    key: 'name',
    header: 'Name',
    render: (user) => <span className="font-medium">{user.name}</span>
  },
  {
    key: 'email',
    header: 'Email'
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (user) => (
      <Button size="sm" onClick={() => handleEdit(user)}>Edit</Button>
    )
  }
];

<Table
  data={users}
  columns={columns}
  loading={isLoading}
  emptyMessage="No users found"
  pagination={{
    currentPage: 1,
    totalPages: 5,
    onPageChange: setPage
  }}
/>
```

---

### Badge Component

**Location**: `src/components/common/Badge.tsx`

Small label component for status indicators.

**Props**:
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage**:
```tsx
import { Badge } from '../components/common/Badge';

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
<Badge variant="danger">Cancelled</Badge>
```

---

## 🏗️ Layout Components

### Layout Component

**Location**: `src/components/layout/Layout.tsx`

Main layout wrapper with sidebar and header.

**Usage**:
```tsx
import { Layout } from '../components/layout/Layout';

// Used in App.tsx with React Router
<Route path="/" element={<Layout />}>
  <Route path="dashboard" element={<Dashboard />} />
</Route>
```

**Features**:
- Responsive sidebar
- Fixed header
- Toast notification container
- Outlet for nested routes

---

### Sidebar Component

**Location**: `src/components/layout/Sidebar.tsx`

Navigation sidebar with menu items.

**Features**:
- Active route highlighting
- Icon + label navigation
- Help section at bottom
- Sticky positioning

**Customization**:
```tsx
// Edit navItems array in Sidebar.tsx
const navItems: NavItem[] = [
  { path: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  // Add more items...
];
```

---

### Header Component

**Location**: `src/components/layout/Header.tsx`

Top navigation bar with search, notifications, and user menu.

**Features**:
- Global search bar
- Notification bell with badge
- User dropdown menu
- Logout functionality

---

## 🎯 Feature-Specific Components

### ContestForm Component

**Location**: `src/components/contests/ContestForm.tsx`

Comprehensive form for creating/editing contests.

**Props**:
```typescript
interface ContestFormProps {
  contest: Contest | null;
  onSave: (contest: Partial<Contest>) => void;
  onCancel: () => void;
}
```

**Usage**:
```tsx
import { ContestForm } from '../components/contests/ContestForm';

<ContestForm
  contest={editingContest}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

**Features**:
- Multi-step form sections
- Prize management
- Participation method selection
- Date pickers
- Validation

---

## 🎨 Styling Guidelines

### Tailwind CSS Classes

**Common Patterns**:
```tsx
// Primary button
className="bg-primary-600 hover:bg-primary-700 text-white"

// Card container
className="bg-white rounded-xl shadow-md p-6 border border-gray-100"

// Input field
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"

// Grid layout
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
```

### Custom Utility Classes

Defined in `src/index.css`:
- `.btn-primary` - Primary button styles
- `.btn-secondary` - Secondary button styles
- `.card` - Card container styles
- `.input-field` - Input field styles

---

## 🔧 Component Best Practices

### 1. Type Safety

Always define TypeScript interfaces for props:
```tsx
interface MyComponentProps {
  title: string;
  onAction: () => void;
  optional?: boolean;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction, optional }) => {
  // Component logic
};
```

### 2. Reusability

Make components generic and configurable:
```tsx
// Good - Flexible
<Button variant="primary" size="lg">Click Me</Button>

// Bad - Hardcoded
<PrimaryButton>Click Me</PrimaryButton>
```

### 3. Composition

Use composition over inheritance:
```tsx
<Card title="User Details">
  <UserInfo user={user} />
  <UserActions onEdit={handleEdit} onDelete={handleDelete} />
</Card>
```

### 4. State Management

Keep state close to where it's used:
```tsx
// Component-level state
const [isOpen, setIsOpen] = useState(false);

// Global state (Zustand)
const { user } = useAuthStore();
```

### 5. Event Handlers

Use descriptive handler names:
```tsx
const handleSubmit = (e: React.FormEvent) => { /* ... */ };
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
const handleDelete = (id: string) => { /* ... */ };
```

---

## 🎭 Animation Guidelines

### Framer Motion Usage

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

**Common Animations**:
- Fade in: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`
- Slide up: `initial={{ y: 20 }} animate={{ y: 0 }}`
- Scale: `initial={{ scale: 0.9 }} animate={{ scale: 1 }}`

---

## 📱 Responsive Design

### Breakpoints

Tailwind CSS breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Usage**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsive grid */}
</div>
```

---

## 🧪 Testing Components

### Example Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

---

**Happy Component Building! 🚀**
