import { Component } from '@angular/core';

interface FAQ {
  question: string;
  answer: string;
  expanded: boolean;
}

@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  faqs: FAQ[] = [
    {
      question: '¿Qué incluye VetApp?',
      answer: 'VetApp incluye gestión de citas, expedientes digitales de mascotas, control de inventario, facturación, reportes y estadísticas, y mucho más. Todo lo que necesitas para administrar tu clínica veterinaria.',
      expanded: false
    },
    {
      question: '¿Es seguro almacenar datos médicos en VetApp?',
      answer: 'Absolutamente. Utilizamos encriptación de nivel empresarial y cumplimos con todas las normativas de protección de datos. Tus datos están respaldados automáticamente y protegidos 24/7.',
      expanded: false
    },
    {
      question: '¿Puedo acceder desde cualquier dispositivo?',
      answer: 'Sí, VetApp es completamente responsive y funciona en computadoras, tablets y smartphones. Puedes acceder a tu clínica desde cualquier lugar con conexión a internet.',
      expanded: false
    },
    {
      question: '¿Ofrecen capacitación para el equipo?',
      answer: 'Por supuesto. Incluimos capacitación completa para tu equipo, documentación detallada y soporte técnico 24/7 para asegurar una transición sin problemas.',
      expanded: false
    },
    {
      question: '¿Cuánto tiempo toma implementar VetApp?',
      answer: 'La implementación básica toma entre 1-3 días. Nuestro equipo te ayuda con la migración de datos y configuración inicial para que puedas comenzar a usar VetApp lo antes posible.',
      expanded: false
    },
    {
      question: '¿Puedo importar mis datos existentes?',
      answer: 'Sí, nuestro equipo técnico te asiste con la migración de datos desde tu sistema actual. Soportamos la mayoría de formatos comunes y aseguramos que no pierdas información.',
      expanded: false
    }
  ];

  /**
   * Alterna la expansión de una pregunta FAQ
   */
  toggleFaq(index: number): void {
    this.faqs[index].expanded = !this.faqs[index].expanded;
  }

  /**
   * Realiza scroll suave a una sección específica
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
} 