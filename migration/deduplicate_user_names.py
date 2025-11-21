#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
User Name Deduplication Migration Script
- Generates unique Korean names for ~30,000 users
- Converts Korean names to English (romanization)
- Updates email, loginid based on English name
- Updates phone numbers to international format
- Excludes admin account
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import random
import os
import sys
from dotenv import load_dotenv

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Load environment variables
load_dotenv()
load_dotenv('backend/.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'nextjs_enterprise_app'),
    'user': os.getenv('DB_USER', 'app_user'),
    'password': os.getenv('DB_PASSWORD', 'your_password'),
    'port': os.getenv('DB_PORT', '5432')
}

# Korean family names (성) - 285 common surnames
FAMILY_NAMES = [
    '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
    '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍',
    '전', '고', '문', '손', '양', '배', '백', '허', '남', '심',
    '노', '하', '곽', '성', '차', '주', '우', '구', '라', '나',
    '진', '유', '방', '민', '변', '지', '석', '원', '도', '목',
    '엄', '마', '채', '제', '천', '염', '표', '맹', '탁', '기',
    '편', '간', '공', '감', '사', '복', '봉', '빈', '빙', '상',
    '설', '소', '선', '섭', '성', '순', '시', '신', '아', '안',
    '애', '야', '양', '어', '연', '염', '영', '예', '오', '옥',
    '온', '왕', '요', '용', '우', '운', '원', '위', '유', '육',
    '윤', '은', '음', '이', '인', '임', '자', '장', '전', '정',
    '제', '조', '종', '좌', '주', '지', '진', '차', '창', '채',
    '천', '초', '최', '추', '충', '치', '탁', '탄', '태', '판',
    '팽', '평', '포', '표', '풍', '피', '하', '학', '한', '함',
    '해', '허', '현', '형', '호', '홍', '화', '환', '황', '후',
    '흥', '희'
]

# Korean given names (이름) - Two character names
GIVEN_NAME_CHARS = [
    # Common characters for given names
    '민', '서', '지', '수', '현', '준', '도', '하', '우', '윤',
    '은', '경', '영', '정', '성', '재', '유', '선', '아', '인',
    '혁', '진', '태', '승', '원', '호', '동', '석', '철', '훈',
    '희', '미', '소', '예', '연', '주', '효', '빈', '나', '다',
    '라', '마', '보', '사', '자', '차', '하', '가', '요', '리',
    '채', '한', '별', '슬', '해', '려', '령', '혜', '화', '란',
    '향', '숙', '옥', '순', '애', '자', '금', '실', '명', '혁',
    '건', '범', '익', '찬', '규', '종', '병', '상', '용', '기',
    '욱', '국', '환', '섭', '균', '겸', '광', '권', '근', '득',
    '률', '명', '목', '묵', '문', '민', '배', '법', '변', '병'
]

# Korean to English romanization mapping (Revised Romanization)
ROMANIZATION = {
    # Consonants
    'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
    'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
    'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
    'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
    # Vowels
    'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo',
    'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
    'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo',
    'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui',
    'ㅣ': 'i',
    # Special mappings for common surnames
    '김': 'Kim', '이': 'Lee', '박': 'Park', '최': 'Choi', '정': 'Jung',
    '강': 'Kang', '조': 'Cho', '윤': 'Yoon', '장': 'Jang', '임': 'Lim',
    '한': 'Han', '오': 'Oh', '서': 'Seo', '신': 'Shin', '권': 'Kwon',
    '황': 'Hwang', '안': 'Ahn', '송': 'Song', '류': 'Ryu', '홍': 'Hong',
    '전': 'Jeon', '고': 'Ko', '문': 'Moon', '손': 'Son', '양': 'Yang',
    '배': 'Bae', '백': 'Baek', '허': 'Heo', '남': 'Nam', '심': 'Shim',
    '노': 'Roh', '하': 'Ha', '곽': 'Kwak', '성': 'Sung', '차': 'Cha',
    '주': 'Joo', '우': 'Woo', '구': 'Koo', '라': 'Ra', '나': 'Na',
    '진': 'Jin', '유': 'Yoo', '방': 'Bang', '민': 'Min', '변': 'Byun',
    '지': 'Ji', '석': 'Seok', '원': 'Won', '도': 'Do', '목': 'Mok'
}

def romanize_korean(korean_text):
    """Convert Korean text to English romanization"""
    if not korean_text:
        return ''

    # Check if it's a common surname
    if korean_text in ROMANIZATION and len(ROMANIZATION[korean_text]) > 1:
        return ROMANIZATION[korean_text]

    result = []
    for char in korean_text:
        if char in ROMANIZATION:
            result.append(ROMANIZATION[char])
        elif '가' <= char <= '힣':
            # Decompose Korean character
            code = ord(char) - 0xAC00
            initial = code // 588
            medial = (code % 588) // 28
            final = code % 28

            initials = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
            medials = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
            finals = ['', 'k', 'k', 'k', 'n', 'n', 'n', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 'h']

            result.append(initials[initial])
            result.append(medials[medial])
            if final > 0:
                result.append(finals[final])
        else:
            result.append(char)

    return ''.join(result).capitalize()

def generate_unique_korean_name(used_names):
    """Generate a unique Korean name"""
    max_attempts = 100
    for _ in range(max_attempts):
        family = random.choice(FAMILY_NAMES)
        given1 = random.choice(GIVEN_NAME_CHARS)
        given2 = random.choice(GIVEN_NAME_CHARS)
        name = f"{family}{given1}{given2}"

        if name not in used_names:
            used_names.add(name)
            return name

    # If still not unique, add a random suffix
    while True:
        family = random.choice(FAMILY_NAMES)
        given1 = random.choice(GIVEN_NAME_CHARS)
        given2 = random.choice(GIVEN_NAME_CHARS)
        suffix = random.randint(1, 999)
        name = f"{family}{given1}{given2}"

        if name not in used_names:
            used_names.add(name)
            return name

def korean_to_english_name(korean_name):
    """Convert Korean name to English format"""
    if not korean_name or len(korean_name) < 2:
        return 'User', 'Unknown'

    # Extract family name (first character) and given name (rest)
    family = korean_name[0]
    given = korean_name[1:]

    # Romanize
    family_en = romanize_korean(family)
    given_en = romanize_korean(given)

    return family_en, given_en

def generate_email(family_en, given_en, used_emails):
    """Generate unique email based on English name"""
    base_email = f"{given_en.lower()}.{family_en.lower()}@samsung.com"

    if base_email not in used_emails:
        used_emails.add(base_email)
        return base_email

    # Add number if duplicate
    counter = 1
    while True:
        email = f"{given_en.lower()}.{family_en.lower()}{counter}@samsung.com"
        if email not in used_emails:
            used_emails.add(email)
            return email
        counter += 1

def generate_phone_number(area_code='02'):
    """Generate Korean phone number in international format"""
    # Seoul: +82-2-XXXX-XXXX
    # Other areas: +82-XX-XXXX-XXXX
    middle = random.randint(1000, 9999)
    last = random.randint(1000, 9999)

    if area_code == '02':
        return f"+82-2-{middle}-{last}"
    else:
        return f"+82-{area_code}-{middle}-{last}"

def generate_mobile_number():
    """Generate Korean mobile number in international format"""
    # +82-10-XXXX-XXXX
    middle = random.randint(1000, 9999)
    last = random.randint(1000, 9999)
    return f"+82-10-{middle}-{last}"

def main():
    print("=" * 80)
    print("User Name Deduplication Migration")
    print("=" * 80)

    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        print("✓ Connected to database")

        # Get all users except admin
        cursor.execute("""
            SELECT id, loginid, name_ko, name_en, email, employee_number, user_category
            FROM users
            WHERE loginid != 'admin'
            ORDER BY id
        """)
        users = cursor.fetchall()

        print(f"✓ Found {len(users)} users (excluding admin)")

        # Track used names and emails
        used_korean_names = set()
        used_emails = set()

        # Reserve admin email
        used_emails.add('admin@samsung.com')

        # Generate updates
        updates = []
        print("\n" + "=" * 80)
        print("Generating unique names and data...")
        print("=" * 80)

        for idx, user in enumerate(users):
            # Generate unique Korean name
            korean_name = generate_unique_korean_name(used_korean_names)

            # Convert to English
            family_en, given_en = korean_to_english_name(korean_name)
            english_name = f"{given_en} {family_en}"

            # Generate email
            email = generate_email(family_en, given_en, used_emails)

            # Extract loginid from email
            loginid = email.split('@')[0]

            # Generate phone numbers
            phone_number = generate_phone_number('02')  # Seoul area code
            mobile_number = generate_mobile_number()

            updates.append({
                'id': user['id'],
                'loginid': loginid,
                'name_ko': korean_name,
                'name_en': english_name,
                'email': email,
                'phone_number': phone_number,
                'mobile_number': mobile_number
            })

            # Progress indicator
            if (idx + 1) % 1000 == 0:
                print(f"  Processed {idx + 1}/{len(users)} users...")

        print(f"✓ Generated {len(updates)} unique user records")

        # Show sample data
        print("\n" + "=" * 80)
        print("Sample generated data (first 10 users):")
        print("=" * 80)
        for i, update in enumerate(updates[:10]):
            print(f"{i+1}. {update['name_ko']} ({update['name_en']})")
            print(f"   Email: {update['email']}")
            print(f"   LoginID: {update['loginid']}")
            print(f"   Phone: {update['phone_number']}")
            print(f"   Mobile: {update['mobile_number']}")
            print()

        # Confirm before updating
        print("=" * 80)
        response = input("Do you want to proceed with the update? (yes/no): ")

        if response.lower() != 'yes':
            print("✗ Update cancelled")
            return

        # Execute updates
        print("\n" + "=" * 80)
        print("Updating database...")
        print("=" * 80)

        update_count = 0
        for idx, update in enumerate(updates):
            cursor.execute("""
                UPDATE users
                SET
                    loginid = %s,
                    name_ko = %s,
                    name_en = %s,
                    email = %s,
                    phone_number = %s,
                    mobile_number = %s,
                    updated_at = NOW()
                WHERE id = %s
            """, (
                update['loginid'],
                update['name_ko'],
                update['name_en'],
                update['email'],
                update['phone_number'],
                update['mobile_number'],
                update['id']
            ))
            update_count += 1

            if (idx + 1) % 1000 == 0:
                conn.commit()
                print(f"  Updated {idx + 1}/{len(updates)} users...")

        # Final commit
        conn.commit()
        print(f"\n✓ Successfully updated {update_count} users")

        # Verification
        print("\n" + "=" * 80)
        print("Verification:")
        print("=" * 80)

        cursor.execute("""
            SELECT COUNT(*) as total,
                   COUNT(DISTINCT name_ko) as unique_korean_names,
                   COUNT(DISTINCT name_en) as unique_english_names,
                   COUNT(DISTINCT email) as unique_emails,
                   COUNT(DISTINCT loginid) as unique_loginids
            FROM users
            WHERE loginid != 'admin'
        """)
        stats = cursor.fetchone()

        print(f"Total users (excl. admin): {stats['total']}")
        print(f"Unique Korean names: {stats['unique_korean_names']}")
        print(f"Unique English names: {stats['unique_english_names']}")
        print(f"Unique emails: {stats['unique_emails']}")
        print(f"Unique loginids: {stats['unique_loginids']}")

        # Check for duplicates
        cursor.execute("""
            SELECT name_ko, COUNT(*) as cnt
            FROM users
            WHERE loginid != 'admin'
            GROUP BY name_ko
            HAVING COUNT(*) > 1
        """)
        duplicates = cursor.fetchall()

        if duplicates:
            print(f"\n✗ WARNING: Found {len(duplicates)} duplicate Korean names:")
            for dup in duplicates[:10]:
                print(f"  - {dup['name_ko']}: {dup['cnt']} occurrences")
        else:
            print("\n✓ No duplicate Korean names found")

        cursor.close()
        conn.close()

        print("\n" + "=" * 80)
        print("Migration completed successfully!")
        print("=" * 80)

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
