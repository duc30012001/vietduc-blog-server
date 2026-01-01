-- ============================================
-- Seed 10,000 Posts for vietduc-blog
-- Run this in DBeaver against your PostgreSQL database
-- ============================================

-- Configuration
DO $$
DECLARE
    creator_uuid UUID := '2128c3e1-1a6e-4281-b2c2-24602428f50d';
    thumbnail_url TEXT := 'https://firebasestorage.googleapis.com/v0/b/vietduc-blog.firebasestorage.app/o/images%2F1767233689351_contosobackground.png?alt=media&token=ca3d6db7-c563-4ad8-842b-7fe34bbadd22';
    
    -- Category IDs
    category_ids UUID[] := ARRAY[
        'd62f99ee-3f9a-49c1-bf61-b9d5df81c5bf'::UUID,
        '7315d3db-9941-48ca-9ac1-fb8cc7be96f7'::UUID,
        '98e2886c-b2a9-40b0-911b-26df5393a1a3'::UUID,
        '4e32874e-833c-49e1-bd57-f7ecd6b434ef'::UUID,
        '2a133f0c-ddd4-4106-83bb-0ba60048a103'::UUID,
        'd60837f0-86c4-436f-b457-1dd201552157'::UUID,
        '62189826-f3af-41b2-8022-19fb0f60fdce'::UUID,
        'e1350f2d-4fea-4ed4-8ce3-5c6c09c2554e'::UUID
    ];

    -- Content templates
    topics_vi TEXT[] := ARRAY[
        'Hướng dẫn lập trình',
        'Kinh nghiệm phát triển phần mềm',
        'Công nghệ mới',
        'Review framework',
        'Tips và tricks',
        'Best practices',
        'Kiến trúc hệ thống',
        'DevOps và CI/CD',
        'Frontend development',
        'Backend development',
        'Database optimization',
        'Cloud computing',
        'Machine learning',
        'Web security',
        'Performance tuning'
    ];
    
    topics_en TEXT[] := ARRAY[
        'Programming Tutorial',
        'Software Development Experience',
        'New Technology',
        'Framework Review',
        'Tips and Tricks',
        'Best Practices',
        'System Architecture',
        'DevOps and CI/CD',
        'Frontend Development',
        'Backend Development',
        'Database Optimization',
        'Cloud Computing',
        'Machine Learning',
        'Web Security',
        'Performance Tuning'
    ];
    
    subjects TEXT[] := ARRAY[
        'React', 'Vue', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
        'Node.js', 'NestJS', 'Express', 'Fastify',
        'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
        'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
        'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust',
        'GraphQL', 'REST API', 'gRPC', 'WebSocket',
        'Git', 'GitHub Actions', 'Jenkins', 'Terraform'
    ];

    content_template_vi TEXT := '## Giới thiệu

Trong bài viết này, chúng ta sẽ tìm hiểu về **%s** và cách áp dụng vào dự án thực tế.

## Nội dung chính

### 1. Tổng quan

%s là một công nghệ/framework phổ biến được sử dụng rộng rãi trong cộng đồng developer. Với những tính năng mạnh mẽ và cộng đồng hỗ trợ lớn, đây là lựa chọn tuyệt vời cho các dự án từ nhỏ đến lớn.

### 2. Cài đặt và cấu hình

```bash
npm install %s
# hoặc
yarn add %s
```

### 3. Ví dụ thực tế

Dưới đây là một ví dụ đơn giản để bạn bắt đầu:

```javascript
// Example code
const example = () => {
  console.log("Hello from %s!");
  return true;
};
```

### 4. Best Practices

- Luôn tuân thủ coding conventions
- Viết unit tests đầy đủ
- Document code rõ ràng
- Review code thường xuyên
- Optimize performance khi cần thiết

## Kết luận

Hy vọng bài viết này giúp bạn hiểu rõ hơn về %s. Hãy để lại comment nếu bạn có câu hỏi!

---

*Bài viết được tạo tự động cho mục đích testing.*';

    content_template_en TEXT := '## Introduction

In this article, we will explore **%s** and how to apply it in real-world projects.

## Main Content

### 1. Overview

%s is a popular technology/framework widely used in the developer community. With powerful features and strong community support, it is an excellent choice for projects of all sizes.

### 2. Installation and Configuration

```bash
npm install %s
# or
yarn add %s
```

### 3. Practical Example

Here is a simple example to get you started:

```javascript
// Example code
const example = () => {
  console.log("Hello from %s!");
  return true;
};
```

### 4. Best Practices

- Always follow coding conventions
- Write comprehensive unit tests
- Document code clearly
- Review code regularly
- Optimize performance when needed

## Conclusion

I hope this article helps you understand %s better. Leave a comment if you have any questions!

---

*This post was auto-generated for testing purposes.*';

    excerpt_template_vi TEXT := 'Khám phá %s - %s. Hướng dẫn chi tiết từ cơ bản đến nâng cao với các ví dụ thực tế.';
    excerpt_template_en TEXT := 'Explore %s - %s. Detailed guide from basics to advanced with practical examples.';

    i INTEGER;
    topic_idx INTEGER;
    subject_idx INTEGER;
    selected_topic_vi TEXT;
    selected_topic_en TEXT;
    selected_subject TEXT;
    post_slug TEXT;
    post_title_vi TEXT;
    post_title_en TEXT;
    post_excerpt_vi TEXT;
    post_excerpt_en TEXT;
    post_content_vi TEXT;
    post_content_en TEXT;
    published_date TIMESTAMP;
    selected_category_id UUID;
    batch_size INTEGER := 1000;
    
BEGIN
    RAISE NOTICE 'Starting to insert 10,000 posts...';
    
    FOR i IN 1..10000 LOOP
        -- Random selection
        topic_idx := 1 + floor(random() * array_length(topics_vi, 1))::INTEGER;
        subject_idx := 1 + floor(random() * array_length(subjects, 1))::INTEGER;
        
        selected_topic_vi := topics_vi[topic_idx];
        selected_topic_en := topics_en[topic_idx];
        selected_subject := subjects[subject_idx];

        -- Random category
        selected_category_id := category_ids[1 + floor(random() * array_length(category_ids, 1))::INTEGER];
        
        -- Generate slug (unique with index)
        post_slug := lower(regexp_replace(selected_subject, '[^a-zA-Z0-9]', '-', 'g')) || '-' || 
                     lower(regexp_replace(selected_topic_en, '[^a-zA-Z0-9]', '-', 'g')) || '-' || 
                     i::TEXT;
        
        -- Generate titles
        post_title_vi := selected_topic_vi || ' ' || selected_subject || ' #' || i::TEXT;
        post_title_en := selected_topic_en || ' ' || selected_subject || ' #' || i::TEXT;
        
        -- Generate excerpts
        post_excerpt_vi := format(excerpt_template_vi, selected_subject, selected_topic_vi);
        post_excerpt_en := format(excerpt_template_en, selected_subject, selected_topic_en);
        
        -- Generate content
        post_content_vi := format(content_template_vi, 
            selected_subject, selected_subject, 
            lower(selected_subject), lower(selected_subject),
            selected_subject, selected_subject);
        post_content_en := format(content_template_en, 
            selected_subject, selected_subject, 
            lower(selected_subject), lower(selected_subject),
            selected_subject, selected_subject);
        
        -- Random published date within last 2 years
        published_date := NOW() - (random() * INTERVAL '730 days');
        
        -- Insert post
        INSERT INTO posts (
            id,
            slug,
            title_vi,
            title_en,
            excerpt_vi,
            excerpt_en,
            content_vi,
            content_en,
            thumbnail,
            status,
            view_count,
            published_at,
            created_at,
            updated_at,
            creator_id,
            category_id
        ) VALUES (
            gen_random_uuid(),
            post_slug,
            post_title_vi,
            post_title_en,
            post_excerpt_vi,
            post_excerpt_en,
            post_content_vi,
            post_content_en,
            thumbnail_url,
            'PUBLISHED',
            floor(random() * 10000)::INTEGER,  -- Random view count 0-9999
            published_date,
            published_date,
            NOW(),
            creator_uuid,
            selected_category_id
        );
        
        -- Progress logging every 1000 records
        IF i % batch_size = 0 THEN
            RAISE NOTICE 'Inserted % posts...', i;
        END IF;
        
    END LOOP;
    
    RAISE NOTICE 'Successfully inserted 10,000 posts!';
END $$;

-- Verify the insert
SELECT COUNT(*) as total_posts FROM posts WHERE status = 'PUBLISHED';
SELECT category_id, COUNT(*) as post_count FROM posts GROUP BY category_id;
SELECT * FROM posts ORDER BY created_at DESC LIMIT 5;
