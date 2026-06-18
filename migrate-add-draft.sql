-- 为现有数据库添加 isDraft 字段
ALTER TABLE posts ADD COLUMN isDraft INTEGER DEFAULT 0;