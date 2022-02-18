package com.mindplates.everyonesprint.biz.project.entity;

import com.mindplates.everyonesprint.biz.sprint.entity.Sprint;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.util.List;

@Entity
@Builder
@Table(name = "project")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Project extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "allow_search")
    private Boolean allowSearch;

    @Column(name = "allow_auto_join")
    private Boolean allowAutoJoin;

    @Column(name = "activated")
    private Boolean activated;


    @OneToMany(fetch = FetchType.EAGER, mappedBy = "project")
    @Column(updatable = false, insertable = false)
    @Fetch(value = FetchMode.SELECT)
    private List<Sprint> sprints;


    @OneToMany(fetch = FetchType.EAGER, mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<ProjectUser> users;

}