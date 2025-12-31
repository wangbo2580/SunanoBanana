# Supabase 数据库配置指南

## 用户使用次数表 (user_usage)

### 用途
记录每个用户的 AI 图片编辑使用次数，实现每账号 2 次免费额度限制。

### 执行步骤

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制下方 SQL 并执行

### SQL 脚本

```sql
-- ============================================
-- 用户使用次数表 (user_usage)
-- ============================================

-- 创建用户使用次数表
CREATE TABLE user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS (Row Level Security)
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- 用户只能读取自己的数据
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能更新自己的数据
CREATE POLICY "Users can update own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- 允许插入（用于首次使用时创建记录）
CREATE POLICY "Users can insert own usage" ON user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 表结构说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键，自动生成 |
| `user_id` | UUID | 关联 auth.users 表，唯一约束 |
| `usage_count` | INTEGER | 使用次数，默认 0 |
| `created_at` | TIMESTAMP | 创建时间 |
| `updated_at` | TIMESTAMP | 更新时间（自动更新） |

### RLS 策略说明

| 策略名 | 操作 | 说明 |
|--------|------|------|
| Users can view own usage | SELECT | 用户只能查看自己的使用记录 |
| Users can update own usage | UPDATE | 用户只能更新自己的使用记录 |
| Users can insert own usage | INSERT | 用户只能插入自己的使用记录 |

### 验证

执行成功后，可以在 **Table Editor** 中看到 `user_usage` 表。
