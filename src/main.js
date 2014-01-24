(function() {

    function parseQueryString(qs) {
        if (!qs) {
            return {};
        }
        var chunks;
        var result = {};
        qs.split('&').forEach(function(val) {
            chunks = val.split('=');
            result[chunks[0]] = decodeURIComponent(chunks[1] || '');
        });
        return result;
    }
    var search = parseQueryString(window.location.search.substr(1));

    if (search.fasthar_api) {
        api_urls.fasthar = search.fasthar_api;
    }
    if (search.chromhar_api) {
        api_urls.chromehar = search.chromehar_api;
    }

    var urls = {
        chart: api_urls.fasthar + '/charts/{stat}?url={url}',
        har_fetch: api_urls.fasthar + '/har/fetch?ref={ref}&url={url}',
        har_view: api_urls.chromehar + '/?url=' + api_urls.fasthar + '/har/history?ref={ref}&url={url}'
    };

    function url(name, data) {
        var uri = urls[name];
        if (uri) {
            Object.keys(data).forEach(function(k) {
                uri = uri.replace('{' + k + '}', data[k] || '');
            });
        }
        return uri;
    }

    var $stat = $('.stat');

    $stat.on('change', function() {
        var qs = '?stat=' + $(this).val();
        if (search.ref) {
            qs += '&ref=' + search.ref;
        }
        if (search.url) {
            qs += '&url=' + search.url;
        }
        window.location.search = qs;
    });

    if (!search.url) {
        $('h1').html('<form>' +
            '<input type="hidden" name="stat" value="' +
            (search.stat || 'sizes') +
            '"><input type="name" class="large" name="url" ' +
            'placeholder="Enter URL here"></form>'
        );
    } else {
        if (!search.stat) {
            $stat.val('sizes').trigger('change');
        }
    }

    if (search.stat) {
        $stat.find('[value="' + search.stat + '"]').attr('selected', '');
    }

    $('.refresh').on('click', function() {
        harFetch();
        setTimeout(function() {
            window.location.reload();
        }, 5000);
    });

    function harFetch() {
        $.get(url('har_fetch', {ref: search.ref, url: search.url}));
    }

    $stat.removeClass('hidden');

    var yAxisFormat;
    var yAxisText;
    var yAxisTicks = 18;

    switch (search.stat) {
        case 'sizes':
            yAxisText = 'Size (KB)';
            yAxisFormat = function(d) {
                if (typeof d === 'number') {
                    return new Number(d).toLocaleString();
                }
                return d;
            };
            break;
        case 'times':
            yAxisText = 'Time (seconds)';
            yAxisFormat = function(d) {
                if (typeof d === 'number') {
                    return ((new Number(d) / 1000) % 60);
                }
                return d;
            };
            break;
        case 'totals':
            yAxisText = '# of requests';
            yAxisFormat = function(d) {
                if (typeof d === 'number') {
                    return new Number(d).toLocaleString();
                }
                return d;
            };
            break;
    }

    if (search.url) {
        // To normalise the URLs (to contain trailing slashes).
        var a = document.createElement('a');
        a.href = search.url;
        search.url = a.href;

        $('h1 a').text(search.url).attr('href', search.url);
        $('title').text(search.url + ' | ' + $stat.find('[selected]').text() + ' | fastHAR');

        var chartUrl = url('chart',
                           {stat: search.stat, ref: search.ref, url: search.url});

        $.getJSON(chartUrl, function(data) {
            var numItems = Object.keys(data).length;
            if (numItems < 2) {
                // Do not show chart data until there are at least two data points.
                harFetch();
                $('main').html('<p class="no-data">No data yet</p>');
                return;
            }

            var chart = c3.generate({
                axis: {
                    x: {
                        categories: data.labels,
                        type: 'categorized',
                    },
                    y: {
                        format: yAxisFormat,
                        min: 0,
                        text: yAxisText,
                        ticks: yAxisTicks
                    }
                },
                bindto: '.chart',
                data: {
                    names: {
                        audio: 'Audio',
                        css: 'CSS',
                        cssimage: 'CSS image (external)',
                        doc: 'HTML',
                        flash: 'Flash',
                        font: 'Font',
                        inlinecssimage: 'CSS image (inline)',
                        inlineimage: 'Image (img)',
                        js: 'JS',
                        json: 'JSON',
                        other: 'Other',
                        total: 'Total',
                        video: 'Video'
                    },
                    columns: data.datasets
                },
                grid: {
                    x: {
                        show:true,
                    },
                    y: {
                        show:true
                    }
                },
                legend: {
                    item: {
                        padding: {
                            top: 100
                        },
                        width: 142
                    }
                },
                point: {
                    onclick: function(d) {
                        var src = url('har_view', {ref: data.labels[d.x], url: search.url});
                        document.querySelector('iframe').setAttribute('src', src);
                    }
                },
                zoom: {
                    enabled: true
                },
                size: {
                    height: 280
                }
            });
        });
    }
})();
