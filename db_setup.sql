CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `secreto` varchar(300) NOT NULL,
  `permiso_pagos` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

INSERT INTO `admins` (`id`, `nombre`, `email`, `secreto`, `permiso_pagos`) VALUES (NULL, 'Admin', 'admin', MD5('admin'), '1');

-- --------------------------------------------------------

CREATE TABLE `datos` (
  `codigo` varchar(100) NOT NULL,
  `valor` varchar(200) NOT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `datos` (`codigo`, `valor`) VALUES ('cajacerrada', '1900-01-01');
INSERT INTO `datos` (`codigo`, `valor`) VALUES ('caja_banco_balance_original', '0');
INSERT INTO `datos` (`codigo`, `valor`) VALUES ('caja_banco_fecha_comienzo', '1900-01-01');
INSERT INTO `datos` (`codigo`, `valor`) VALUES ('nombre', 'Asociación Civil');
INSERT INTO `datos` (`codigo`, `valor`) VALUES ('url', 'http://localhost/');

-- --------------------------------------------------------

CREATE TABLE `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_admin` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `tag` varchar(50) NOT NULL,
  `mensaje` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_socio` int(11) NULL,
  `id_suscripcion_socio` int(11) NULL,
  `valor` decimal(10,2) NOT NULL,
  `razon` varchar(300) NOT NULL,
  `fecha_pago` date NOT NULL,
  `notas` text NULL,
  `cancelado` tinyint(1) NOT NULL DEFAULT 0,
  `descuento` decimal(10,2) NULL,
  `descuento_razon` varchar(200) NULL,
  `rubro` varchar(50) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

CREATE TABLE `suscripcion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `ciclo` ENUM('anual', 'mensual', 'semestral') NULL,
  `allow_multi` tinyint(1) NOT NULL,
  `includes_sub_socios` int(2) NULL,
  `acepta_pagos` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

CREATE TABLE `suscripcion_precios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_suscripcion` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `fecha_desde` date NOT NULL,
  `fecha_hasta` date NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

CREATE TABLE `suscripcion_socio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_socio` int(11) NOT NULL,
  `id_suscripcion` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `vinculos` varchar(50) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

CREATE TABLE `socios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `documento` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_egreso` date NULL,
  `fecha_nacimiento` date NULL,
  `tags` varchar(500) NULL,
  `telefono` varchar(100) NOT NULL,
  `observaciones` varchar(500) NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `hash` varchar(500) NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `color` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;

-- --------------------------------------------------------

CREATE TABLE `cantina_turnos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `caja_inicio` decimal(10,2) NOT NULL,
  `caja_fin` decimal(10,2) NULL,
  `encargado` varchar(200) NOT NULL,
  `tags` TEXT NOT NULL,
  `notas` TEXT,
  `inicio` datetime NOT NULL,
  `fin` datetime,
  `activo` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

CREATE TABLE `cantina_transaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pago` int(11) NULL,
  `id_turno` int(11) NOT NULL,
  `id_intercaja` int(11) NULL,
  `valor` decimal(10,2) NOT NULL,
  `fecha_pago` date NOT NULL,
  `cancelado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

CREATE TABLE `banco_transaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pago` int(11) NULL,
  `id_intercaja` int(11) NULL,
  `valor` decimal(10,2) NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `documento` varchar(200) NOT NULL,
  `asunto` varchar(200) NOT NULL,
  `fecha_pago` date NOT NULL,
  `is_split` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

CREATE TABLE `banco_transaction_split` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pago` int(11) NOT NULL,
  `id_transaction` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------

CREATE TABLE `transaction_entre_cajas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `valor` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `caja_origen` ENUM('BROU','Cantina','Personal') NOT NULL,
  `caja_destino` ENUM('BROU','Cantina','Personal') NOT NULL,
  `cancelado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;

-- --------------------------------------------------------