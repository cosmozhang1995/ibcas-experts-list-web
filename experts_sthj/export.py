# -*- coding: utf-8 -*-

from pymongo import MongoClient

db = MongoClient().experts_sthj
member_collection = db.member

members = member_collection.find()

for member in members:
    print member['name']
    titles = ' '.join(member['titles'])
    print titles if not titles == "" else "none"
    emails = member['emails']
    print emails if not emails == "" else "none"
    print u"生态环境研究中心"
    interests = member['interests']
    print interests if not interests == "" else "none"
    print member['link']
    print ""