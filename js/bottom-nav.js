(function () {
  var navItems = document.querySelectorAll('.bottom-nav__item');
  if (!navItems.length) return;

  var sectionIds = ['home', 'work', 'projects'];

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navItems.forEach(function (item) {
          item.classList.toggle('active', item.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.4 });

  sectionIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}());
