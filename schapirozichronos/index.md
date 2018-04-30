---
layout: default
title: "Rabbi Schapiro's Zichronos"
published: true
---
# {{ page.title }}

{%- assign col = site.collections | where:"label","schapirozichronos" | first %}
On 25 Menachem Av 5777, [Rabbi Yehuda Leib Schapiro](https://www.chabad.org/search/keyword_cdo/kid/13269/jewish/Yehuda-Leib-Schapiro.htm) began recording his memories (zichronos) of the Lubavitcher Rebbe. Acting on his express permission to redistribute his recordings ([Episode 1]({{ site.schapirozichronos[0].url }})), I am working on converting his series to [podcast format]({{ col.url | absolute_url }}podcast.rss).

If you are using an iPad or iPhone, make sure that the silent mode switch on your device is off. Otherwise, the audio will not play.

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

## Contributing

Help is welcome! If you would like to contribute to this project, please make a pull request to [this site on GitHub](https://github.com/chaimleib/chaimleib.github.io).

