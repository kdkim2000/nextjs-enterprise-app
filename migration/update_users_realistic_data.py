#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update users table with realistic data:
1. Convert Korean names to romanized English names
2. Generate email addresses based on romanized names (firstname.lastname@samsung.com)
3. Add +82- prefix to phone numbers for international format
"""

import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../backend/.env')

# Korean to English romanization mapping (using Revised Romanization of Korean)
# Surname mapping
SURNAME_MAP = {
    '김': 'Kim',
    '이': 'Lee',
    '박': 'Park',
    '최': 'Choi',
    '정': 'Jung',
    '강': 'Kang',
    '조': 'Cho',
    '윤': 'Yoon',
    '장': 'Jang',
    '임': 'Lim',
    '한': 'Han',
    '오': 'Oh',
    '서': 'Seo',
    '신': 'Shin',
    '권': 'Kwon',
    '황': 'Hwang',
    '안': 'Ahn',
    '송': 'Song',
    '전': 'Jeon',
    '홍': 'Hong',
    '고': 'Ko',
    '문': 'Moon',
    '양': 'Yang',
    '손': 'Son',
    '배': 'Bae',
    '백': 'Baek',
    '허': 'Heo',
    '유': 'Yoo',
    '남': 'Nam',
    '심': 'Shim',
    '노': 'Noh',
    '하': 'Ha',
    '곽': 'Kwak',
    '성': 'Sung',
    '차': 'Cha',
    '주': 'Joo',
    '우': 'Woo',
    '구': 'Koo',
    '나': 'Na',
}

# Given name syllables mapping
SYLLABLE_MAP = {
    # ㄱ
    '가': 'ga', '각': 'gak', '간': 'gan', '갈': 'gal', '감': 'gam', '강': 'gang', '개': 'gae', '거': 'geo',
    '건': 'geon', '걸': 'geol', '검': 'geom', '게': 'ge', '겸': 'gyeom', '경': 'gyeong', '고': 'go', '곤': 'gon',
    '골': 'gol', '공': 'gong', '과': 'gwa', '관': 'gwan', '광': 'gwang', '괴': 'goe', '교': 'gyo', '구': 'gu',
    '국': 'guk', '군': 'gun', '굴': 'gul', '궁': 'gung', '권': 'gwon', '귀': 'gwi', '규': 'gyu', '균': 'gyun',
    '그': 'geu', '근': 'geun', '글': 'geul', '금': 'geum', '기': 'gi', '긴': 'gin', '길': 'gil', '김': 'gim',
    # ㄴ
    '나': 'na', '낙': 'nak', '난': 'nan', '남': 'nam', '낭': 'nang', '내': 'nae', '너': 'neo', '넉': 'neok',
    '널': 'neol', '네': 'ne', '녀': 'nyeo', '녕': 'nyeong', '노': 'no', '녹': 'nok', '논': 'non', '놀': 'nol',
    '농': 'nong', '뇌': 'noe', '누': 'nu', '눈': 'nun', '뉴': 'nyu', '느': 'neu', '는': 'neun', '늘': 'neul',
    '니': 'ni',
    # ㄷ
    '다': 'da', '단': 'dan', '달': 'dal', '담': 'dam', '당': 'dang', '대': 'dae', '더': 'deo', '덕': 'deok',
    '던': 'deon', '덜': 'deol', '데': 'de', '도': 'do', '독': 'dok', '돈': 'don', '돌': 'dol', '동': 'dong',
    '두': 'du', '둔': 'dun', '득': 'deuk', '등': 'deung', '디': 'di',
    # ㄹ
    '라': 'ra', '락': 'rak', '란': 'ran', '람': 'ram', '랑': 'rang', '래': 'rae', '량': 'ryang', '려': 'ryeo',
    '력': 'ryeok', '련': 'ryeon', '렬': 'ryeol', '령': 'ryeong', '례': 'rye', '로': 'ro', '록': 'rok', '론': 'ron',
    '롱': 'rong', '뢰': 'roe', '료': 'ryo', '루': 'ru', '룡': 'ryong', '류': 'ryu', '륙': 'ryuk', '률': 'ryul',
    '륜': 'ryun', '르': 'reu', '른': 'reun', '를': 'reul', '름': 'reum', '릉': 'reung', '리': 'ri', '린': 'rin',
    '릴': 'ril', '림': 'rim',
    # ㅁ
    '마': 'ma', '막': 'mak', '만': 'man', '말': 'mal', '맘': 'mam', '망': 'mang', '매': 'mae', '맥': 'maek',
    '먼': 'meon', '메': 'me', '면': 'myeon', '멸': 'myeol', '명': 'myeong', '모': 'mo', '목': 'mok', '몽': 'mong',
    '묘': 'myo', '무': 'mu', '묵': 'muk', '문': 'mun', '물': 'mul', '므': 'meu', '미': 'mi', '민': 'min',
    '밀': 'mil',
    # ㅂ
    '바': 'ba', '박': 'bak', '반': 'ban', '발': 'bal', '밤': 'bam', '방': 'bang', '배': 'bae', '백': 'baek',
    '번': 'beon', '벌': 'beol', '범': 'beom', '법': 'beop', '변': 'byeon', '별': 'byeol', '병': 'byeong', '보': 'bo',
    '복': 'bok', '본': 'bon', '봉': 'bong', '부': 'bu', '북': 'buk', '분': 'bun', '불': 'bul', '붕': 'bung',
    '비': 'bi', '빈': 'bin', '빙': 'bing',
    # ㅅ
    '사': 'sa', '삭': 'sak', '산': 'san', '살': 'sal', '삼': 'sam', '상': 'sang', '새': 'sae', '색': 'saek',
    '서': 'seo', '석': 'seok', '선': 'seon', '설': 'seol', '섬': 'seom', '성': 'seong', '세': 'se', '소': 'so',
    '속': 'sok', '손': 'son', '솔': 'sol', '송': 'song', '수': 'su', '숙': 'suk', '순': 'sun', '술': 'sul',
    '숭': 'sung', '스': 'seu', '슬': 'seul', '승': 'seung', '시': 'si', '식': 'sik', '신': 'sin', '실': 'sil',
    '심': 'sim',
    # ㅇ
    '아': 'a', '악': 'ak', '안': 'an', '알': 'al', '암': 'am', '앙': 'ang', '애': 'ae', '액': 'aek',
    '야': 'ya', '약': 'yak', '양': 'yang', '어': 'eo', '억': 'eok', '언': 'eon', '얼': 'eol', '엄': 'eom',
    '업': 'eop', '에': 'e', '여': 'yeo', '역': 'yeok', '연': 'yeon', '열': 'yeol', '염': 'yeom', '영': 'yeong',
    '예': 'ye', '오': 'o', '옥': 'ok', '온': 'on', '올': 'ol', '옹': 'ong', '와': 'wa', '완': 'wan',
    '왕': 'wang', '외': 'oe', '요': 'yo', '욕': 'yok', '용': 'yong', '우': 'u', '욱': 'uk', '운': 'un',
    '울': 'ul', '웅': 'ung', '워': 'wo', '원': 'won', '월': 'wol', '위': 'wi', '유': 'yu', '육': 'yuk',
    '윤': 'yun', '율': 'yul', '으': 'eu', '은': 'eun', '을': 'eul', '음': 'eum', '응': 'eung', '의': 'ui',
    '이': 'i', '익': 'ik', '인': 'in', '일': 'il', '임': 'im',
    # ㅈ
    '자': 'ja', '작': 'jak', '잔': 'jan', '잠': 'jam', '장': 'jang', '재': 'jae', '저': 'jeo', '적': 'jeok',
    '전': 'jeon', '절': 'jeol', '점': 'jeom', '정': 'jeong', '제': 'je', '조': 'jo', '족': 'jok', '존': 'jon',
    '종': 'jong', '좌': 'jwa', '죄': 'joe', '주': 'ju', '죽': 'juk', '준': 'jun', '줄': 'jul', '중': 'jung',
    '즉': 'jeuk', '지': 'ji', '직': 'jik', '진': 'jin', '질': 'jil', '짐': 'jim',
    # ㅊ
    '차': 'cha', '착': 'chak', '찬': 'chan', '찰': 'chal', '참': 'cham', '창': 'chang', '채': 'chae', '책': 'chaek',
    '처': 'cheo', '천': 'cheon', '철': 'cheol', '첨': 'cheom', '청': 'cheong', '체': 'che', '초': 'cho', '촉': 'chok',
    '총': 'chong', '최': 'choe', '추': 'chu', '축': 'chuk', '춘': 'chun', '출': 'chul', '충': 'chung', '취': 'chwi',
    '치': 'chi', '친': 'chin', '칠': 'chil',
    # ㅋ
    '카': 'ka', '칸': 'kan', '캉': 'kang', '커': 'keo', '컬': 'keol', '케': 'ke', '코': 'ko', '쿠': 'ku',
    '크': 'keu', '킨': 'kin', '키': 'ki',
    # ㅌ
    '타': 'ta', '탁': 'tak', '탄': 'tan', '탈': 'tal', '탐': 'tam', '태': 'tae', '택': 'taek', '터': 'teo',
    '테': 'te', '토': 'to', '통': 'tong', '투': 'tu', '특': 'teuk', '티': 'ti',
    # ㅍ
    '파': 'pa', '판': 'pan', '팔': 'pal', '패': 'pae', '퍼': 'peo', '편': 'pyeon', '평': 'pyeong', '폐': 'pye',
    '포': 'po', '표': 'pyo', '푸': 'pu', '프': 'peu', '플': 'peul', '피': 'pi', '필': 'pil',
    # ㅎ
    '하': 'ha', '학': 'hak', '한': 'han', '할': 'hal', '함': 'ham', '항': 'hang', '해': 'hae', '핵': 'haek',
    '향': 'hyang', '허': 'heo', '헌': 'heon', '혁': 'hyeok', '현': 'hyeon', '혈': 'hyeol', '형': 'hyeong', '혜': 'hye',
    '호': 'ho', '혹': 'hok', '혼': 'hon', '홍': 'hong', '화': 'hwa', '확': 'hwak', '환': 'hwan', '활': 'hwal',
    '황': 'hwang', '회': 'hoe', '획': 'hoek', '효': 'hyo', '후': 'hu', '훈': 'hun', '훙': 'hung', '휘': 'hwi',
    '휴': 'hyu', '흠': 'heum', '흥': 'heung', '희': 'hui', '흰': 'huin', '히': 'hi',
}

def romanize_korean_name(korean_name):
    """
    Convert Korean name to romanized English name
    Format: Surname + Given name (first letter capitalized for each)
    Example: 김철수 -> Kim Chulsu, 이영희 -> Lee Younghee
    """
    if not korean_name or len(korean_name) < 2:
        return None

    # Most Korean names: 1 character surname + 2 characters given name
    surname = korean_name[0]
    given_name = korean_name[1:]

    # Get romanized surname
    surname_roman = SURNAME_MAP.get(surname, surname)

    # Romanize given name syllables
    given_parts = []
    for char in given_name:
        roman = SYLLABLE_MAP.get(char, char)
        given_parts.append(roman)

    # Capitalize first letter of given name
    given_roman = ''.join(given_parts)
    if given_roman:
        given_roman = given_roman[0].upper() + given_roman[1:]

    return f"{surname_roman} {given_roman}"

def generate_email(name_en, user_id):
    """
    Generate email from English name with user ID to ensure uniqueness
    Example: Kim Chulsu (U000000000001) -> chulsu.kim.u000000000001@samsung.com
    """
    if not name_en or ' ' not in name_en:
        return None

    parts = name_en.strip().split()
    if len(parts) < 2:
        return None

    surname = parts[0].lower()
    given_name = parts[1].lower()

    # Extract last 6 digits of user ID to keep email shorter
    user_suffix = user_id[-6:].lower() if user_id else ''

    return f"{given_name}.{surname}.{user_suffix}@samsung.com"

def format_phone_international(phone):
    """
    Add +82- prefix for international format
    Example: 02-1234-5678 -> +82-2-1234-5678
           010-1234-5678 -> +82-10-1234-5678
    """
    if not phone:
        return None

    phone = phone.strip()

    # Remove leading 0 and add +82-
    if phone.startswith('0'):
        phone = phone[1:]

    return f"+82-{phone}"

def main():
    # Database connection
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'nextjs_enterprise_app')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')

    print(f"Connecting to database: {db_name}@{db_host}:{db_port}")

    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        database=db_name,
        user=db_user,
        password=db_password
    )

    cur = conn.cursor()

    # Fetch all users
    cur.execute("SELECT id, name_ko, phone_number, mobile_number FROM users WHERE name_ko IS NOT NULL")
    users = cur.fetchall()

    print(f"Found {len(users)} users to update")

    updated_count = 0
    error_count = 0

    for user_id, name_ko, phone_number, mobile_number in users:
        try:
            # Romanize Korean name
            name_en = romanize_korean_name(name_ko)
            if not name_en:
                print(f"  Warning: Could not romanize name for user {user_id}: {name_ko}")
                error_count += 1
                continue

            # Generate email with user ID to ensure uniqueness
            email = generate_email(name_en, user_id)
            if not email:
                print(f"  Warning: Could not generate email for user {user_id}: {name_en}")
                error_count += 1
                continue

            # Format phone numbers
            phone_intl = format_phone_international(phone_number) if phone_number else None
            mobile_intl = format_phone_international(mobile_number) if mobile_number else None

            # Update user
            cur.execute("""
                UPDATE users
                SET name_en = %s,
                    email = %s,
                    phone_number = %s,
                    mobile_number = %s
                WHERE id = %s
            """, (name_en, email, phone_intl, mobile_intl, user_id))

            updated_count += 1

            if updated_count % 1000 == 0:
                print(f"  Updated {updated_count} users...")
                conn.commit()

        except Exception as e:
            print(f"  Error updating user {user_id}: {e}")
            error_count += 1

    # Commit final changes
    conn.commit()

    print(f"\n=== Update Complete ===")
    print(f"Total users: {len(users)}")
    print(f"Successfully updated: {updated_count}")
    print(f"Errors: {error_count}")

    # Show sample results
    print("\n=== Sample Results ===")
    cur.execute("""
        SELECT id, name_ko, name_en, email, phone_number, mobile_number
        FROM users
        ORDER BY id
        LIMIT 10
    """)

    samples = cur.fetchall()
    for row in samples:
        print(f"{row[0]}: {row[1]} -> {row[2]} | {row[3]} | {row[4]} | {row[5]}")

    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
