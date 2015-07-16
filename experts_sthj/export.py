# -*- coding: utf-8 -*-

from pymongo import MongoClient

db = MongoClient().experts_sthj
member_collection = db.member

members = member_collection.find()

for member in members:
    print member['name']
    print ' '.join(member['titles'])
    print member['emails']
    print u"生态环境研究中心"
    print member['interests']
    print member['link']
    print ""