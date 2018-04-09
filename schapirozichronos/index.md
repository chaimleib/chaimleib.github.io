---
layout: default
title: "Rabbi Schapiro's Zichronos"
published: true
---
# {{ page.title }}

{%- assign col = site.collections | where:"label","schapirozichronos" | first %}
On 25 Menachem Av 5777, [Rabbi Yehuda Leib Schapiro](https://www.chabad.org/search/keyword_cdo/kid/13269/jewish/Yehuda-Leib-Schapiro.htm) began recording his memories (zichronos) of the Lubavitcher Rebbe. Acting on his express permission to redistribute his recordings ([Episode 1]({{ site.schapirozichronos[0].url }})), I am working on converting his series to [podcast format]({{ col.url | absolute_url }}podcast.rss).

## Episodes

{% assign tracks = site.schapirozichronos | sort: 'name' %}
<ol class="post-list">
{% for track in tracks %}
  <li>
    <a href="{{ track.url }}">
      #{{ track.order }} – {{ track.hdate }}: {{ track.title }}
    </a>
  </li>
{% endfor %}
</ol>
