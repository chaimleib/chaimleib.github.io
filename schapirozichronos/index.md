---
layout: default
title: "Rabbi Schapiro's Zichronos"
published: true
---
On 25 Menachem Av 5777, Rabbi Y. L. Schapiro began recording his memories (zichronos) of the Lubavitcher Rebbe. Acting on his express permission to redistribute his recordings ([Episode 1]({{ site.schapirozichronos[0].url }})), I am working on converting his series to podcast format.

## Episodes

{% assign tracks = site.schapirozichronos | sort: 'name' %}
<ol class="post-list">
{% for track in tracks %}
  <li>
    <a href="{{ track.url }}">
      #{{ forloop.index }} – {{ track.hdate }}: {{ track.title }}
    </a>
  </li>
{% endfor %}
</ol>
