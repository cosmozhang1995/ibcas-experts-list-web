# -*- coding: utf-8 -*-
import scrapy
from scrapy import Request
from pyquery import PyQuery as pq
from pymongo import MongoClient

db = MongoClient().experts_sthj
member_collection = db.member

class DefaultSpiderSpider(scrapy.Spider):
    name = "default"
    allowed_domains = ["rcees.cas.cn"]
    total_page = 11

    def start_requests(self):
        for i in range(0, self.total_page):
            url = "http://www.rcees.cas.cn/rcjy/index_%d.html" % i
            if i == 0: url = "http://www.rcees.cas.cn/rcjy/"
            yield Request(url, callback = self.parse)

    def parse(self, response):
        html_pq = pq(response.body_as_unicode())
        table_pq = pq(pq(pq(pq(pq(pq(html_pq('body').children('table')[2]).children('tr')[0]).children('td')[1]).children('table')[2]).children('tr').children('td').children('table')[0]).children('tr').children('td').children('table')[2])
        table_trs = table_pq.children('tr')
        table_trs.pop(0)
        for tr in table_trs:
            item = {}
            tr_pq = pq(tr)
            tr_pq('style').remove()
            tds = tr_pq.children('td')
            name_link_pq = pq(tds[0])('a')
            item["name"] = name_link_pq.text().strip(' ')
            item["link"] = name_link_pq.attr('href')
            item["gender"] = pq(tds[1]).text().strip(' ')
            item["titles"] = pq(tds[2]).text().strip(' ').split(u'，')
            item["interests"] = pq(tds[3]).text().strip(' ')
            item["emails"] = pq(tds[4]).text().strip(' ')
            member_collection.insert(item)