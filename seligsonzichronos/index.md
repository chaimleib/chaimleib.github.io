---
layout: default
title: "Rabbi Seligson's Zichronos"
description: "Rabbi Michoel Seligson's stories of the Lubavitcher Rebbe."
published: true
---
# {{ page.title }}

{%- assign col = site.collections | where:"label","seligsonzichronos" | first %}
On the 12 Tishrei 5778, Rabbi Michoel Seligson began recording his memories (zichronos) of the Lubavitcher Rebbe. With his consent, I am working on converting his series to [podcast format]({{ col.url | absolute_url }}podcast.rss).

If you are using an iPad or iPhone, make sure that the silent mode switch on your device is off. Otherwise, the audio will not play.

## Episodes

{% assign tracks = site.seligsonzichronos | sort: 'order' %}
<ol class="post-list">
{% for track in tracks %}
  <li>
    <a href="{{ track.url }}">
      #{{ track.order }} – {{ track.title }}
    </a>
  </li>
{% endfor %}
</ol>

## Contributing

Help is welcome! If you would like to contribute to this project, please make a pull request to [this site on GitHub](https://github.com/chaimleib/chaimleib.github.io).

