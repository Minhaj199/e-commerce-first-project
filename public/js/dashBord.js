window.onload = async function () {
  const datas = await fetch("/admin/fetchData?from=chartData", {
    method: "get",
  });
  const response = await datas.json();
  const cat = response.category;
  const catList = response.categorylist;
  const soldCategories = cat;
  const availableCategories = catList;
  const categoryCounts = {};
  soldCategories.forEach((item) => {
    categoryCounts[item._id] = item.total;
  });

  availableCategories[0].category.forEach((category) => {
    if (!categoryCounts.hasOwnProperty(category)) {
      categoryCounts[category] = 0;
    }
  });

  const labels = Object.keys(categoryCounts);
  const counts = Object.values(categoryCounts);

  var ctx = document.getElementById("myPieChart").getContext("2d");
  var myPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Order sales by Category",
          data: counts,
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 159, 64, 0.7)",
          ],
        },
      ],
    },
    options: {},
  });
};

document.addEventListener("DOMContentLoaded", async function () {
  const ctx = document.getElementById("salesChart").getContext("2d");
  let salesChart;

  const data = {
    labels: [], // Will be populated based on filter
    datasets: [
      {
        label: "Expected Sales",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        data: [], // Will be populated based on filter
      },
      {
        label: "Actual Sales",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        data: [], // Will be populated based on filter
      },
    ],
  };

  let monthlySale = await fetch("/admin/fetchData?from=salesActual", {
    method: "get",
  });
  let response = await monthlySale.json();



  function fetchData(filter) {
    const monthlyData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      expected: [1000, 800, 1200, 1800, 2300],
      actual: response,
    };
    monthlyData.actual.push(response);
    const yearlyData = {
      labels: ["2021", "2022", "2023", "2024"],
      expected: [22000, 28000, 32000, 36000],
      actual: [21000, 27000, 31000, 35000],
    };

    return filter === "monthly" ? monthlyData : yearlyData;
  }

  function updateChart(filter) {
    const { labels, expected, actual } = fetchData(filter);
    data.labels = labels;
    data.datasets[0].data = expected;
    data.datasets[1].data = actual;

    if (salesChart) {
      salesChart.destroy();
    }

    salesChart = new Chart(ctx, {
      type: "bar",
      data: data,
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: false,
          },
          y: {
            stacked: false,
          },
        },
      },
    });
  }

  updateChart(document.getElementById("filter").value);

  document.getElementById("filter").addEventListener("change", function () {
    updateChart(this.value);
  });
});
