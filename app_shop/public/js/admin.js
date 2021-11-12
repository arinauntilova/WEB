const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;

  const productElement = btn.closest("article");

  fetch(`/admin/product/${prodId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  })
    .then(() => productElement.remove())
    .catch((err) => console.log(err));
};


function ajaxGet(url, callback) {
  let r = new XMLHttpRequest();
  r.open("GET", url, true);
  r.send(null);
  r.onload = function () {
    callback(r.response);
  };
}

// гистограмма среднего чека
const ShowAnalys_avg_bill = (btn) => {

  $('#help_id').html('');
  $('#help_id').html('<canvas id="grafica" width="405" height="135" ></canvas>');

  // Получение ссылки на элемент canvas в DOM
  var ctx = document.getElementById('grafica').getContext('2d');
      
  // Tags - это метки, которые идут по оси X.  
  const tags = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
  
  var el = document.getElementById('year1');
  var year = el.options[el.selectedIndex].innerHTML;
  console.log(year);

  ajaxGet("/admin/analytics/graph_bill?year=" + year, (res) => {
    data = JSON.parse(res);

    // У нас может быть несколько наборов данных. Давайте начнем с одного
    const dataSales = {
      label: "Средний чек",
      data: data, // Данные представляют собой массив, который должен иметь такое же количество значений, как и количество тегов.
      backgroundColor: 'rgba(255,210,0, 0.6)', // Цвет фона
      borderColor: 'rgba(54, 162, 235, 1)', // Цвет границ
      borderWidth: 1.5,// Толщина границ
    };
    var Gr = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: tags,
        datasets: [
          dataSales
        ]
      }
    });
  })
};

// гистограмма прибыли
const ShowAnalys_benefit = (btn) => {

  $('#help_id').html('');
  $('#help_id').html('<canvas id="grafica" width="405" height="135" ></canvas>');

  // Получение ссылки на элемент canvas в DOM
  var ctx = document.getElementById('grafica').getContext('2d');
      
  // Tags - это метки, которые идут по оси X.  
  const tags = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
  
  var el = document.getElementById('year1');
  var year = el.options[el.selectedIndex].innerHTML;
  console.log(year);

  ajaxGet("/admin/analytics/graph_benefit?year=" + year, (res) => {
    data = JSON.parse(res);
    // У нас может быть несколько наборов данных. Давайте начнем с одного
    const dataSales = {
      label: "Прибыль",
      data: data, // Данные представляют собой массив, который должен иметь такое же количество значений, как и количество тегов.
      backgroundColor: 'rgba(255, 192, 203)', // Цвет фона
      borderColor: 'rgba(54, 162, 235, 1)', // Цвет границ
      borderWidth: 1.5,// Толщина границ
    };
    var Gr = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: tags,
        datasets: [
          dataSales
        ]
      }
    });
  })
};

// жанры самых популярных картин
const ShowAnalys_popgenres = (btn) => {

  $('#help_id').html('');
  $('#help_id').html('<canvas id="grafica" width="405" height="135" ></canvas>');

  var ctx = document.getElementById('grafica').getContext('2d');

  ajaxGet("/admin/analytics/graph_popgenres", (res) => {
    data = JSON.parse(res);
    console.log("DATA !!!", Object.keys(data)[0]);
    // console.log("LEN !!!", data.length);
    let labels = [];
    let value = [];
    let i = 0;
    for (let d in data) {
      labels.push(Object.keys(data)[i]);
      value.push(data[labels[i]]);
      i++;
    }
    // labels.push("остальные")

        
    gradient = {
      0: [255, 255, 255, 1],
      20: [255, 236, 179, 1],
      45: [232, 82, 133, 1],
      65: [106, 27, 154, 1],
      100: [0, 0, 0, 1]
  };

    //Get a sorted array of the gradient keys
    var gradientKeys = Object.keys(gradient);
    gradientKeys.sort(function(a, b) {
        return +a - +b;
    });

    let setsCount = Object.keys(data).length;
    //Calculate colors
    let chartColors = [];
    for (i = 0; i < setsCount; i++) {
        var gradientIndex = (i + 1) * (100 / (setsCount + 1)); //Find where to get a color from the gradient
        for (j = 0; j < gradientKeys.length; j++) {
            var gradientKey = gradientKeys[j];
            if (gradientIndex === +gradientKey) { //Exact match with a gradient key - just get that color
                chartColors[i] = 'rgba(' + gradient[gradientKey].toString() + ')';
                break;
            } else if (gradientIndex < +gradientKey) { //It's somewhere between this gradient key and the previous
                var prevKey = gradientKeys[j - 1];
                var gradientPartIndex = (gradientIndex - prevKey) / (gradientKey - prevKey); //Calculate where
                var color = [];
                for (k = 0; k < 4; k++) { //Loop through Red, Green, Blue and Alpha and calculate the correct color and opacity
                    color[k] = gradient[prevKey][k] - ((gradient[prevKey][k] - gradient[gradientKey][k]) * gradientPartIndex);
                    if (k < 3) color[k] = Math.round(color[k]);
                }
                chartColors[i] = 'rgba(' + color.toString() + ')';
                break;
            }
        }
    }


    var myChart = new Chart(ctx, {
      type: 'doughnut',   //type: 'pie', - круговая диаграмма
      data: {
          labels: labels,
          datasets: [{
              data: value,
              backgroundColor: chartColors, //['#e91e63', '#00e676', '#ff5722', '#1e88e5', '#ffd600'],
              borderWidth: 0.5 ,
              borderColor: '#ddd'
          }]
      },
      options: {
          title: {
              display: true,
              text: 'Жанры самых продаваемых картин',
              position: 'top',
              fontSize: 16,
              fontColor: '#111',
              padding: 20
          },
          legend: {
              display: true,
              position: 'bottom',
              labels: {
                  boxWidth: 20,
                  fontColor: '#111',
                  padding: 15
              }
          },
          tooltips: {
              enabled: false
          },
          plugins: {
              datalabels: {
                  color: '#111',
                  textAlign: 'center',
                  font: {
                      lineHeight: 1.6
                  },
                  formatter: function(value, ctx) {
                      return ctx.chart.data.labels[ctx.dataIndex] + '\n' + value + '%';
                  }
              }
          }
      }
  });

  })
};


// жанры самых часто возвращаемых товаров
const ShowAnalys_nonpopgenres = (btn) => {

  $('#help_id').html('');
  $('#help_id').html('<canvas id="grafica" width="405" height="135" ></canvas>');

  var ctx = document.getElementById('grafica').getContext('2d');

  ajaxGet("/admin/analytics/graph_nonpopgenres", (res) => {
    data = JSON.parse(res);
    console.log("DATA !!!", Object.keys(data)[0]);
    // console.log("LEN !!!", data.length);
    let labels = [];
    let value = [];
    let i = 0;
    for (let d in data) {
      labels.push(Object.keys(data)[i]);
      value.push(data[labels[i]]);
      i++;
    }
    // labels.push("остальные")

    
    gradient = {
      0: [255, 255, 255, 1],
      20: [254, 235, 101, 1],
      45: [228, 82, 27, 1],
      65: [77, 52, 47, 1],
      100: [0, 0, 0, 1]
   };

    //Get a sorted array of the gradient keys
    var gradientKeys = Object.keys(gradient);
    gradientKeys.sort(function(a, b) {
        return +a - +b;
    });

    let setsCount = Object.keys(data).length;
    //Calculate colors
    let chartColors = [];
    for (i = 0; i < setsCount; i++) {
        var gradientIndex = (i + 1) * (100 / (setsCount + 1)); //Find where to get a color from the gradient
        for (j = 0; j < gradientKeys.length; j++) {
            var gradientKey = gradientKeys[j];
            if (gradientIndex === +gradientKey) { //Exact match with a gradient key - just get that color
                chartColors[i] = 'rgba(' + gradient[gradientKey].toString() + ')';
                break;
            } else if (gradientIndex < +gradientKey) { //It's somewhere between this gradient key and the previous
                var prevKey = gradientKeys[j - 1];
                var gradientPartIndex = (gradientIndex - prevKey) / (gradientKey - prevKey); //Calculate where
                var color = [];
                for (k = 0; k < 4; k++) { //Loop through Red, Green, Blue and Alpha and calculate the correct color and opacity
                    color[k] = gradient[prevKey][k] - ((gradient[prevKey][k] - gradient[gradientKey][k]) * gradientPartIndex);
                    if (k < 3) color[k] = Math.round(color[k]);
                }
                chartColors[i] = 'rgba(' + color.toString() + ')';
                break;
            }
        }
    }


    var myChart = new Chart(ctx, {
      type: 'doughnut',   //type: 'pie', - круговая диаграмма
      data: {
          labels: labels,
          datasets: [{
              data: value,
              backgroundColor: chartColors,//['#e91e63', '#00e676', '#ff5722', '#1e88e5', '#ffd600'],
              borderWidth: 0.5 ,
              borderColor: '#ddd'
          }]
      },
      options: {
          title: {
              display: true,
              text: 'Жанры самых часто возвращаемых картин',
              position: 'top',
              fontSize: 16,
              fontColor: '#111',
              padding: 20
          },
          legend: {
              display: true,
              position: 'bottom',
              labels: {
                  boxWidth: 20,
                  fontColor: '#111',
                  padding: 15
              }
          },
          tooltips: {
              enabled: false
          },
          plugins: {
              datalabels: {
                  color: '#111',
                  textAlign: 'center',
                  font: {
                      lineHeight: 1.6
                  },
                  formatter: function(value, ctx) {
                      return ctx.chart.data.labels[ctx.dataIndex] + '\n' + value + '%';
                  }
              }
          }
      }
  });

  })
};


var dynamicColors = function() {
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return "rgb(" + r + "," + g + "," + b + ")";
};



// самые популярные товары
const ShowAnalys_titles = (btn) => {

  $('#help_id').html('');
  $('#help_id').html('<canvas id="grafica" width="605" height="185" ></canvas>');

  var ctx = document.getElementById('grafica').getContext('2d');

  var el = document.getElementById('year1');
  var year = el.options[el.selectedIndex].innerHTML;
  console.log(year);

  ajaxGet("/admin/analytics/graph_titles?year=" + year, (res) => {
    data = JSON.parse(res);
    console.log("DATA !!!", Object.keys(data)[0]);
    // console.log("LEN !!!", data.length);
    let labels = [];
    let value = [];
    let i = 0;
    for (let d in data) {
      labels.push(Object.keys(data)[i]);
      value.push(data[labels[i]]);
      i++;
    }

    // let mas_col = ['#e91e63', '#00e676', '#ff5722', '#ffd600', "#0074D9", "#FF4136", "#2ECC40", "#7FDBFF", "#B10DC9", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA"]

    // ===== RANDOM COLOURS ======
    var coloR = [];
    for (let i in value) {
      let col = dynamicColors();
      // console.log("COL ", col);
      coloR.push(col);
    }
    // ============================

    gradient = {
      0: [255, 255, 255, 1],
      20: [220, 237, 200, 1],
      45: [66, 179, 213, 1],
      65: [26, 39, 62, 1],
      100: [0, 0, 0, 1]
    };

    //Get a sorted array of the gradient keys
    var gradientKeys = Object.keys(gradient);
    gradientKeys.sort(function(a, b) {
        return +a - +b;
    });

    let setsCount = Object.keys(data).length;
    //Calculate colors
    let chartColors = [];
    for (i = 0; i < setsCount; i++) {
        var gradientIndex = (i + 1) * (100 / (setsCount + 1)); //Find where to get a color from the gradient
        for (j = 0; j < gradientKeys.length; j++) {
            var gradientKey = gradientKeys[j];
            if (gradientIndex === +gradientKey) { //Exact match with a gradient key - just get that color
                chartColors[i] = 'rgba(' + gradient[gradientKey].toString() + ')';
                break;
            } else if (gradientIndex < +gradientKey) { //It's somewhere between this gradient key and the previous
                var prevKey = gradientKeys[j - 1];
                var gradientPartIndex = (gradientIndex - prevKey) / (gradientKey - prevKey); //Calculate where
                var color = [];
                for (k = 0; k < 4; k++) { //Loop through Red, Green, Blue and Alpha and calculate the correct color and opacity
                    color[k] = gradient[prevKey][k] - ((gradient[prevKey][k] - gradient[gradientKey][k]) * gradientPartIndex);
                    if (k < 3) color[k] = Math.round(color[k]);
                }
                chartColors[i] = 'rgba(' + color.toString() + ')';
                break;
            }
        }
    }


    var myChart = new Chart(ctx, {
      type: 'pie',   //type: 'pie', - круговая диаграмма
      data: {
          labels: labels,
          datasets: [{
              data: value,
              backgroundColor: chartColors, //coloR, //mas_col,
              borderWidth: 0.5 ,
              borderColor: '#ddd'
          }]
      },
      options: {
          title: {
              display: true,
              text: 'Товары, которые чаще всего были куплены в указанном году',
              position: 'top',
              fontSize: 16,
              fontColor: '#111',
              padding: 20
          },
          legend: {
              display: true,
              position: 'bottom',
              labels: {
                  boxWidth: 20,
                  fontColor: '#111',
                  padding: 15
              }
          },
          tooltips: {
              enabled: true
          },
          plugins: {
              datalabels: {
                  color: '#111',
                  textAlign: 'center',
                  font: {
                      lineHeight: 1.6
                  },
                  formatter: function(value, ctx) {
                      return ctx.chart.data.labels[ctx.dataIndex] + '\n' + value + '%';
                  }
              }
          }
      }
  });

  })
};






// самые популярные поставщики
const ShowAnalys_providers = (btn) => {

  $('#help_id').html('');
  $('#help_id').html('<canvas id="grafica" width="605" height="185" ></canvas>');

  var ctx = document.getElementById('grafica').getContext('2d');

  var el = document.getElementById('year1');
  var year = el.options[el.selectedIndex].innerHTML;
  console.log(year);

  ajaxGet("/admin/analytics/graph_providers?year=" + year, (res) => {
    data = JSON.parse(res);
    console.log("DATA !!!", Object.keys(data)[0]);
    // console.log("LEN !!!", data.length);
    let labels = [];
    let value = [];
    let i = 0;
    for (let d in data) {
      labels.push(Object.keys(data)[i]);
      value.push(data[labels[i]]);
      i++;
    }

    // let mas_col = ['#e91e63', '#00e676', '#ff5722', '#ffd600', "#0074D9", "#FF4136", "#2ECC40", "#7FDBFF", "#B10DC9", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA"]

    // ===== RANDOM COLOURS ======
    var coloR = [];
    for (let i in value) {
      let col = dynamicColors();
      // console.log("COL ", col);
      coloR.push(col);
    }
    // ============================

    gradient = {
      0: [255, 255, 255, 1],
      20: [238, 174, 238, 1],
      45: [180, 82, 205, 1],
      65: [85, 26, 139, 1],
      100: [0, 0, 0, 1]
    };

    //Get a sorted array of the gradient keys
    var gradientKeys = Object.keys(gradient);
    gradientKeys.sort(function(a, b) {
        return +a - +b;
    });

    let setsCount = Object.keys(data).length;
    //Calculate colors
    let chartColors = [];
    for (i = 0; i < setsCount; i++) {
        var gradientIndex = (i + 1) * (100 / (setsCount + 1)); //Find where to get a color from the gradient
        for (j = 0; j < gradientKeys.length; j++) {
            var gradientKey = gradientKeys[j];
            if (gradientIndex === +gradientKey) { //Exact match with a gradient key - just get that color
                chartColors[i] = 'rgba(' + gradient[gradientKey].toString() + ')';
                break;
            } else if (gradientIndex < +gradientKey) { //It's somewhere between this gradient key and the previous
                var prevKey = gradientKeys[j - 1];
                var gradientPartIndex = (gradientIndex - prevKey) / (gradientKey - prevKey); //Calculate where
                var color = [];
                for (k = 0; k < 4; k++) { //Loop through Red, Green, Blue and Alpha and calculate the correct color and opacity
                    color[k] = gradient[prevKey][k] - ((gradient[prevKey][k] - gradient[gradientKey][k]) * gradientPartIndex);
                    if (k < 3) color[k] = Math.round(color[k]);
                }
                chartColors[i] = 'rgba(' + color.toString() + ')';
                break;
            }
        }
    }


    var myChart = new Chart(ctx, {
      type: 'pie',   //type: 'pie', - круговая диаграмма
      data: {
          labels: labels,
          datasets: [{
              data: value,
              backgroundColor: chartColors, //coloR, //mas_col,
              borderWidth: 0.5 ,
              borderColor: '#ddd'
          }]
      },
      options: {
          title: {
              display: true,
              text: 'Поставщики, чьи товары оказались наиболее покупаемы',
              position: 'top',
              fontSize: 16,
              fontColor: '#111',
              padding: 20
          },
          legend: {
              display: true,
              position: 'bottom',
              labels: {
                  boxWidth: 20,
                  fontColor: '#111',
                  padding: 15
              }
          },
          tooltips: {
              enabled: true
          },
          plugins: {
              datalabels: {
                  color: '#111',
                  textAlign: 'center',
                  font: {
                      lineHeight: 1.6
                  },
                  formatter: function(value, ctx) {
                      return ctx.chart.data.labels[ctx.dataIndex] + '\n' + value + '%';
                  }
              }
          }
      }
  });

  })
};

