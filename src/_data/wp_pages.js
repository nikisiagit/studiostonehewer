module.exports = async function() {
  const BASE_URL = process.env.PAYLOAD_API_URL || "http://127.0.0.1:3000";
  const API_URL = `${BASE_URL}/api/globals`;

  const splitText = (text) => {
    if (!text) return [];
    return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
  };

  const getUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const rawVirtualExpectations = `A design questionnaire to get to know you\n60 minutes of 1:1 virtual time with an interior designer\nOne moodboard plus one review per room\nOne 3D elevation plus one review per room\nColour and fabric consulting and guidance for each room\nA bespoke shopping list with a minimum of 10 items per room (based on your budget)`;
  const rawFullExpectations = `1:1 consultations — collaborating with you to ensure your new home incorporates all the elements you're looking for\nFull service review — working with your architect and construction team on space planning\nInterior concept — taking away the guesswork by selecting materials, colours, fabrics and finishes for you\nTurnkey installation — delivering the finishing touches, ensuring everything tells a bespoke story`;
  const rawAboutBody = `Amidst the hum of sewing machines, vibrant fabrics, explosions of colour, and warmth of peers, a young Eric discovered his passion for creating. From challenging beginnings, at the age of 14, he found a new home in the world of art — a way to transform the ordinary into the extraordinary.\nFrom those early days, Eric's eye for design was realised, beginning to cultivate bespoke spaces in every place he inhabited, each one a canvas for his boundless imagination. Whether it was a cosy nook or a grand moment, Eric's knack for crafting tailored experiences and unforgettable moments quickly became his signature.\nNow, Eric channels that same youthful, classic, and uninhibited enthusiasm into every project. His eye for detail and ability to blend functionality with elegance deliver the unique Studio Stonehewer experience.`;
  const rawGuides = `Texture first | Material and tactility before decoration.\nQuiet luxury | Considered, lasting, never loud.\nPersonal moments | Adding visual touches of your personality to every space`;

  let home = {
    heroLeftImage: "/assets/images/home-hero-left.jpeg",
    heroLeftCaption: "Amsterdam ",
    heroRightImage: "/assets/images/home-hero-right.jpeg",
    heroRightCaption: "Poole Dorset",
    quoteText: "I am unapologetically you. I am a visual, textural, and sensory story of your emotions and the world you want to create. I will provide a space for you to build and grow. Here, you will make memories and share stories. You will laugh, learn, and love. I will be a constant through the ordinary and extraordinary. I am your sanctuary. I am your home.",
    quoteAuthor: "'HOME' BY STUDIO STONEHEWER",
    studioSubtitle: "THE STUDIO",
    studioTitle: "Interiors with feeling",
    studioDescription: "Studio Stonehewer is an interior design practice devoted to spaces that feel as good as they look. We work slowly and intentionally, layering materials, light, personal curiosa, and considered detail to create homes that hold your story.",
    projectsSubtitle: "PORTFOLIO",
    projectsTitle: "Projects",
    projectsDescription: "Each project begins with a feeling and ends with a home. From full-service residential interiors to flexible, virtual design studies, browse a selection of our recent work.",
    hwwSubtitle: "THE STUDIO",
    hwwTitle: "How we work",
    hwwDescription: "Studio Stonehewer is a small, intentional practice. We offer two ways to work together: a flexible virtual service and a full, hands-on service, so each home receives the attention and care it deserves.",
    hwwImage: "/assets/images/how-we-work.jpeg",
    virtualTitle: "The Digital Studio",
    virtualDescription: "Digital Interior Design offers a flexible and virtual approach to one or multiple spaces. Through design mapping, creation and reviews, we create a custom plan with moodboards, 3D elevations and shopping lists that can be implemented on your own time and budget.",
    virtualExpectations: splitText(rawVirtualExpectations),
    fullTitle: "The Full Service Studio",
    fullDescription: "An interior design service for larger scale projects including in-person consultations, project management, site visits, furniture procurement and supporting hands-on installation.",
    fullExpectations: splitText(rawFullExpectations),
    ctaTitle: "Have a space in mind?",
    ctaDescription: "Whichever service feels right, we'd love to hear about your home and how you want it to feel.",
    aboutSubtitle: "ABOUT",
    aboutTitle: "Studio Stonehewer",
    aboutImage: "/assets/images/about.jpeg",
    aboutRole: "FOUNDER",
    aboutName: "Eric Stonehewer",
    aboutBody: splitText(rawAboutBody),
    guides: splitText(rawGuides),
    finalCtaTitle: "Let's create your home",
    contactSubtitle: "CONTACT",
    contactTitle: "Say hello",
    contactDescription: "Whether you're ready to begin or simply exploring ideas, we'd love to hear from you. Tell us a little about your home and what you're hoping to create.",
    contactEmail: "studiostonehewer@gmail.com",
    contactInstagram: "@studiostonehewer"
  };

  let portfolio = {
    seoDescription: "Browse our collection of curated interior design projects.",
    subtitle: "PORTFOLIO",
    headerTitle: "All Projects",
    headerDescription: "Each project begins with a feeling and ends with a home. Browse our full selection of recent work."
  };

  try {
    const homeRes = await fetch(`${API_URL}/home`);
    const portRes = await fetch(`${API_URL}/portfolio`);

    if (homeRes.ok && portRes.ok) {
      const homeData = await homeRes.json();
      const portData = await portRes.json();

      // Only use live data if fields were actually filled out, otherwise fallback
      if (homeData && homeData.quote_text) {
        home = {
          heroLeftImage: getUrl(homeData.hero_left_image?.url) || home.heroLeftImage,
          heroLeftCaption: homeData.hero_left_caption || home.heroLeftCaption,
          heroRightImage: getUrl(homeData.hero_right_image?.url) || home.heroRightImage,
          heroRightCaption: homeData.hero_right_caption || home.heroRightCaption,
          quoteText: homeData.quote_text || home.quoteText,
          quoteAuthor: homeData.quote_author || home.quoteAuthor,
          studioSubtitle: homeData.studio_subtitle || home.studioSubtitle,
          studioTitle: homeData.studio_title || home.studioTitle,
          studioDescription: homeData.studio_description || home.studioDescription,
          projectsSubtitle: homeData.projects_subtitle || home.projectsSubtitle,
          projectsTitle: homeData.projects_title || home.projectsTitle,
          projectsDescription: homeData.projects_description || home.projectsDescription,
          hwwSubtitle: homeData.hww_subtitle || home.hwwSubtitle,
          hwwTitle: homeData.hww_title || home.hwwTitle,
          hwwDescription: homeData.hww_description || home.hwwDescription,
          hwwImage: getUrl(homeData.hww_image?.url) || home.hwwImage,
          virtualTitle: homeData.virtual_title || home.virtualTitle,
          virtualDescription: homeData.virtual_description || home.virtualDescription,
          virtualExpectations: homeData.virtual_expectations ? splitText(homeData.virtual_expectations) : home.virtualExpectations,
          fullTitle: homeData.full_title || home.fullTitle,
          fullDescription: homeData.full_description || home.fullDescription,
          fullExpectations: homeData.full_expectations ? splitText(homeData.full_expectations) : home.fullExpectations,
          ctaTitle: homeData.cta_title || home.ctaTitle,
          ctaDescription: homeData.cta_description || home.ctaDescription,
          aboutSubtitle: homeData.about_subtitle || home.aboutSubtitle,
          aboutTitle: homeData.about_title || home.aboutTitle,
          aboutImage: getUrl(homeData.about_image?.url) || home.aboutImage,
          aboutRole: homeData.about_role || home.aboutRole,
          aboutName: homeData.about_name || home.aboutName,
          aboutBody: homeData.about_body ? splitText(homeData.about_body) : home.aboutBody,
          guides: homeData.guides ? splitText(homeData.guides) : home.guides,
          finalCtaTitle: homeData.final_cta_title || home.finalCtaTitle,
          contactSubtitle: homeData.contact_subtitle || home.contactSubtitle,
          contactTitle: homeData.contact_title || home.contactTitle,
          contactDescription: homeData.contact_description || home.contactDescription,
          contactEmail: homeData.contact_email || home.contactEmail,
          contactInstagram: homeData.contact_instagram || home.contactInstagram,
          meta: homeData.meta || {}
        };
      }
      
      if (portData && portData.header_title) {
        portfolio = {
          seoDescription: portData.seo_description || portfolio.seoDescription,
          subtitle: portData.subtitle || portfolio.subtitle,
          headerTitle: portData.header_title || portfolio.headerTitle,
          headerDescription: portData.header_description || portfolio.headerDescription,
          meta: portData.meta || {}
        };
      }
    }
  } catch (e) {
    console.log("Could not connect to Payload Pages API. Using dummy data.");
  }

  return { home, portfolio };
};
