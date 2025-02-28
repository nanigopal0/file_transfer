package com.learn.java.filetransfer.configuration;

import freemarker.cache.ClassTemplateLoader;
import freemarker.cache.TemplateLoader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer;

@Configuration
public class FreeMarkerTemplateConfig {

    @Bean
    public FreeMarkerConfigurer freeMarkerClassLoaderConfig() {
        freemarker.template.Configuration configuration = new freemarker.template.Configuration(freemarker.template.Configuration.VERSION_2_3_33);
        TemplateLoader templateLoader = new ClassTemplateLoader(this.getClass(), "/templates");
        configuration.setTemplateLoader(templateLoader);
        FreeMarkerConfigurer freeMarkerConfigurer = new FreeMarkerConfigurer();
        freeMarkerConfigurer.setConfiguration(configuration);
        return freeMarkerConfigurer;

//        FreeMarkerConfigurationFactoryBean factoryBean = new FreeMarkerConfigurationFactoryBean();
//        factoryBean.setTemplateLoaderPath("classpath:/templates/");
//        FreeMarkerConfigurer freeMarkerConfigurer = new FreeMarkerConfigurer();
//        freeMarkerConfigurer.setConfiguration(factoryBean.createConfiguration());
//        return freeMarkerConfigurer;
    }
}


