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
    var GET = parseQueryString(window.location.search.substr(1));

    if (GET.fasthar_api) {
        api_urls.fasthar = GET.fasthar_api;
    }
    if (GET.chromhar_api) {
        api_urls.chromehar = GET.chromehar_api;
    }

    var urls = {
        chart: api_urls.fasthar + '/charts/{stat}?url={url}',
        har_fetch: api_urls.fasthar + '/har/fetch?ref={ref}&url={url}',
        har: api_urls.fasthar + '/har/history?ref={ref}&url={url}'
    };
    urls.har_view = api_urls.chromehar + '/?url=' + urls.har;

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
        if (GET.ref) {
            qs += '&ref=' + GET.ref;
        }
        if (GET.url) {
            qs += '&url=' + GET.url;
        }
        window.location.search = qs;
    });

    if (!GET.stat) {
        GET.stat = 'sizes';
        $stat.val('sizes').trigger('change');
    }

    $stat.find('[value="' + GET.stat + '"]').attr('selected', '');

    if (!GET.url) {
        $('h1').html('<form>' +
            '<input type="hidden" name="stat" value="' + GET.stat +
            '"><input type="name" class="large" name="url" ' +
            'placeholder="Enter URL here"></form>'
        );
    }

    $('.refresh').on('click', function() {
        harFetch();
        setTimeout(function() {
            window.location.reload();
        }, 5000);
    });

    function harFetch() {
        $.get(url('har_fetch', {ref: GET.ref, url: GET.url}));
    }

    $stat.removeClass('hidden');

    var yAxisFormat;
    var yAxisText;
    var yAxisTicks = 18;

    switch (GET.stat) {
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

    if (GET.url) {
        // To normalise the URLs (to contain trailing slashes).
        var a = document.createElement('a');
        a.href = GET.url;
        GET.url = a.href;

        $('h1 a').text(GET.url).attr('href', GET.url);
        $('title').text(GET.url + ' | ' + $stat.find('[selected]').text() + ' | fastHAR');

        var chartUrl = url('chart',
                           {stat: GET.stat, ref: GET.ref, url: GET.url});

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
                        var params = {ref: data.labels[d.x], url: GET.url};
                        document.querySelector('iframe').setAttribute('src', url('har_view', params));
                        document.querySelector('.export-options').innerHTML = '<a target="_blank" class="button export" href="' + url('har', params) + '">Export HAR</a>';
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
