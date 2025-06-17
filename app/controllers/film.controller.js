exports.findAll = async (req, res) => {
  try {
    const films = await Film.findAll();

    // Optionnel : vérifier et convertir le BLOB en Buffer si besoin
    const filmsWithBase64 = films.map(film => {
      const filmJson = film.toJSON();
      if (filmJson.image_affiche) {

        filmJson.image_affiche = Buffer.from(filmJson.image_affiche).toString('base64');
      }
      return filmJson;
    });

    res.render('films', { films: filmsWithBase64 });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
};
